import os
import json
import time
import boto3
from typing import TypedDict
from botocore.config import Config
from openai import OpenAI

# from aws_xray_sdk.core import xray_recorder
# from aws_xray_sdk.core import patch_all

from LoggingClass import LoggingClass

# ----------------------------------------------------------------------
# Environment Variable Setting
# ----------------------------------------------------------------------
try:
    S3_BUCKET = os.environ["BUCKET_NAME"]
except KeyError:
    raise Exception("Environment variable is not defined.")

# ----------------------------------------------------------------------
# Global Variable Setting
# ----------------------------------------------------------------------
try:
    config = Config(
        retries={"max_attempts": 30, "mode": "standard"},
        read_timeout=900,
        connect_timeout=900,
    )
    model_client = boto3.client("bedrock", config=config)
    bedrock_client = boto3.client("bedrock-runtime", config=config)
    secrets_client = boto3.client(service_name="secretsmanager", config=config)
except Exception:
    raise Exception("Boto3 client error")

# ----------------------------------------------------------------------
# Logger & Tracing Setting
# ----------------------------------------------------------------------
try:
    logger = LoggingClass("DEBUG")
    log = logger.get_logger()

    # xray_recorder.configure(service="Chat")
    # patch_all()
except Exception:
    raise Exception("Logger Setting failed")


# ----------------------------------------------------------------------
# Main Function
# ----------------------------------------------------------------------
# @xray_recorder.capture("main")
def main(event):
    try:
        if any(message["role"] == "claude" for message in MESSAGE):
            response_claude()
        if any(message["role"] == "gpt" for message in MESSAGE):
            key, org, pj = get_secret()
            response_gpt(key, org, pj)

    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise


# ----------------------------------------------------------------------
# Get OpenAPI Key from Secrets Manager
# ----------------------------------------------------------------------
def get_secret():
    try:
        key_name = "openapikey"
        org_name = "openapiorg"
        pj_name = "openapipj"
        key_response = secrets_client.get_secret_value(SecretId=key_name)
        org_response = secrets_client.get_secret_value(SecretId=org_name)
        pj_response = secrets_client.get_secret_value(SecretId=pj_name)
        key_json = key_response["SecretString"]
        org_json = org_response["SecretString"]
        pj_json = pj_response["SecretString"]
        key_dict = json.loads(key_json)
        org_dict = json.loads(org_json)
        pj_dict = json.loads(pj_json)
        key = key_dict[key_name]
        org = org_dict[org_name]
        pj = pj_dict[pj_name]
        return key, org, pj
    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise


# ----------------------------------------------------------------------
# Response with Claude
# ----------------------------------------------------------------------
# @xray_recorder.capture("response_claude")
def response_claude():
    try:
        log.debug("claude処理中")
        user_prompt = []

        for message in MESSAGE:
            role = "user" if message["role"] == "claude" else message["role"]
            user_prompt.append(
                {
                    "role": role,
                    "content": [
                        {
                            "type": "text",
                            "text": message["message"],
                        },
                    ],
                }
            )
        log.debug(f"Claude User Prompt: {user_prompt}")
        model_id = "anthropic.claude-3-haiku-20240307-v1:0"
        system_prompt = """
あなたは人々が質問やその他の要望に対して対話的に答える手助けをします。さまざまなトピックに関する非常に広範な要求がされるでしょう。あなたは広範な検索エンジンや同様のツールを備えており、それらを使って回答を調査します。あなたの焦点は、ユーザーのニーズにできるだけ最良の方法で対応することです。
"""
        body = json.dumps(
            {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4000,
                "system": system_prompt,
                "messages": user_prompt,
            }
        )
        response = bedrock_client.invoke_model_with_response_stream(
            body=body,
            contentType="application/json",
            accept="application/json",
            modelId=model_id,
        )
        websocket_client = boto3.client(
            "apigatewaymanagementapi",
            endpoint_url=f"https://{DOMAIN_NAME}/{STAGE_NAME}",
        )
        retries = 5
        while retries > 0:
            stream = response.get("body")
            if stream:
                for event in stream:
                    chunk = event.get("chunk")
                    if chunk:
                        chunk_json = json.loads(chunk.get("bytes").decode())
                        if chunk_json["type"] == "content_block_delta":
                            data = chunk_json["delta"]["text"]
                            json_data = {
                                "role": "claude",
                                "message": data,
                            }
                            # JSON形式にして送信
                            json_bytes = json.dumps(json_data).encode()
                            websocket_client.post_to_connection(Data=json_bytes, ConnectionId=CONNECT_ID)

            else:
                time.sleep(1)
                retries -= 1
        log.debug("Stream ended")
    except Exception as e:
        websocket_client = boto3.client(
            "apigatewaymanagementapi",
            endpoint_url=f"https://{DOMAIN_NAME}/{STAGE_NAME}",
        )
        data = "エラーが発生しました。"
        bytes_data = data.encode()
        websocket_client.post_to_connection(Data=bytes_data, ConnectionId=CONNECT_ID)
        log.error(f"エラーが発生しました: {e}")
        raise


# ----------------------------------------------------------------------
# Response With GPT
# ----------------------------------------------------------------------
def response_gpt(key, org, pj):
    try:
        client = OpenAI(
            api_key=key,
            organization=org,
            project=pj,
        )
        user_prompt = []
        for message in MESSAGE:
            role = "user" if message["role"] == "gpt" else message["role"]
            user_prompt.append(
                {
                    "role": role,
                    "content": message["message"],
                }
            )
        log.debug(f"GPT User Prompt: {user_prompt}")
        stream = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=user_prompt,
            stream=True,
        )
        websocket_client = boto3.client(
            "apigatewaymanagementapi",
            endpoint_url=f"https://{DOMAIN_NAME}/{STAGE_NAME}",
        )
        retries = 5
        while retries > 0:
            if stream:
                for chunk in stream:
                    if chunk.choices[0].delta.content is not None:
                        data = chunk.choices[0].delta.content
                        json_data = {
                            "role": "gpt",
                            "message": data,
                        }
                        json_bytes = json.dumps(json_data).encode()
                        websocket_client.post_to_connection(Data=json_bytes, ConnectionId=CONNECT_ID)

            else:
                time.sleep(1)
                retries -= 1
        log.debug("Stream ended")
    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise


# ----------------------------------------------------------------------
# Entry Point
# ----------------------------------------------------------------------
# @xray_recorder.capture("lambda_handler")
def lambda_handler(event, context):
    try:
        log.debug(f"Event: {event}")
        global ROUTE_KEY, CONNECT_ID, DOMAIN_NAME, STAGE_NAME, MESSAGE
        ROUTE_KEY = event["requestContext"]["routeKey"]
        CONNECT_ID = event["requestContext"]["connectionId"]
        DOMAIN_NAME = event["requestContext"]["domainName"]
        STAGE_NAME = event["requestContext"]["stage"]
        if "body" in event:
            MESSAGE = json.loads(event["body"])  # defaultルートの場合のみ存在
            log.debug(f"Message: {MESSAGE}")
        else:
            MESSAGE = "nothing"
        connection_info = {
            "Route Key": ROUTE_KEY,
            "Connection ID": CONNECT_ID,
            "Domain Name": DOMAIN_NAME,
            "Stage Name": STAGE_NAME,
        }
        log.info(f"Connection Info: {connection_info}")
        # Connect
        if ROUTE_KEY == "$connect":
            return {"statusCode": 200, "body": "Connected"}
        # Disconnect
        if ROUTE_KEY == "$disconnect":
            return {"statusCode": 200, "body": "Disconnected"}
        # Default
        main(event)
        return {"statusCode": 200, "body": "Default Exit"}
    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise
