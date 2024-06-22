import os
import json
import boto3
from typing import TypedDict
from botocore.config import Config
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all

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
except Exception:
    raise Exception("Boto3 client error")

# ----------------------------------------------------------------------
# Logger & Tracing Setting
# ----------------------------------------------------------------------
try:
    logger = LoggingClass("DEBUG")
    log = logger.get_logger()

    xray_recorder.configure(service="Chat")
    patch_all()
except Exception:
    raise Exception("Logger Setting failed")


# ----------------------------------------------------------------------
# Main Function
# ----------------------------------------------------------------------
@xray_recorder.capture("main")
def main(event):
    try:
        response = create_message(event)
        return response
    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise


# ----------------------------------------------------------------------
# Create Chat Message
# ----------------------------------------------------------------------
@xray_recorder.capture("create_message")
def create_message(event):
    try:
        message = event["message"]
        user_prompt = {
            "role": event["role"],
            "content": [
                {
                    "type": "text",
                    "text": message,
                },
            ],
        }
        model_id = "anthropic.claude-3-sonnet-20240229-v1:0"
        system_prompt = """
あなたは人々が質問やその他の要望に対して対話的に答える手助けをします。さまざまなトピックに関する非常に広範な要求がされるでしょう。あなたは広範な検索エンジンや同様のツールを備えており、それらを使って回答を調査します。あなたの焦点は、ユーザーのニーズにできるだけ最良の方法で対応することです。
"""
        body = json.dumps(
            {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4000,
                "system": system_prompt,
                "messages": [user_prompt],
            }
        )
        response = bedrock_client.invoke_model(
            body=body,
            contentType="application/json",
            accept="application/json",
            modelId=model_id,
        )
        response_content = json.loads(response["body"].read())
        response_format = {
            "role": response_content["role"],
            "text": response_content["content"][0]["text"],
        }
        response_body = json.dumps(response_format)
        log.debug(f"response_body is: {response_body}")
        return response_body
    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise


# ----------------------------------------------------------------------
# Entry Point
# ----------------------------------------------------------------------
class ChatDict(TypedDict):
    role: str
    message: str


@xray_recorder.capture("lambda_handler")
def lambda_handler(event: ChatDict, context):
    try:
        # model_list = model_client.list_foundation_models()["modelSummaries"]
        # log.debug(f"model_list: {model_list}")
        log.debug(f"event: {event}")
        response: ChatDict = main(event)
        return response
    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise
