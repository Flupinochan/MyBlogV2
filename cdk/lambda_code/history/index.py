import os
import json
import time
import boto3
from typing import TypedDict
from botocore.config import Config

# from aws_xray_sdk.core import xray_recorder
# from aws_xray_sdk.core import patch_all

from LoggingClass import LoggingClass

# ----------------------------------------------------------------------
# Environment Variable Setting
# ----------------------------------------------------------------------
try:
    DYNAMODB_TABLE = os.environ["DYNAMODB_TABLE"]
    PRIMARY_KEY = os.environ["PRIMARY_KEY"]
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
    dynamodb_client = boto3.client("dynamodb", config=config)
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
        if event["http_method"] == "GET":
            response = get_chat_history(event)
        elif event["http_method"] == "GET":
            response = post_chat_history(event)
        return response

    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise


# ----------------------------------------------------------------------
# Get Chat History
# ----------------------------------------------------------------------
# @xray_recorder.capture("get_chat_history")
def get_chat_history(event):
    try:
        login_id = event["queryStringParameters"]["loginid"]
        log.debug(f"login_id: {login_id}")
        response = dynamodb_client.get_item(
            TableName=DYNAMODB_TABLE,
            Key={
                PRIMARY_KEY: {
                    "S": login_id,
                }
            },
        )
        log.debug(response)
        if "Item" in response:
            item = response["Item"]
            content = item.get("content", {"L": []})["L"]
            chat_history = []
            for chat_item in content:
                chat_content = {
                    "role": chat_item["M"]["role"]["S"],
                    "message": chat_item["M"]["message"]["S"],
                }
                chat_history.append(chat_content)
            status_code = 200
            response_data = chat_history
        else:
            status_code = 204
            response_data = None
        response = {
            "statusCode": status_code,
            "body": json.dumps(response_data),
        }
        return response
    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise


# ----------------------------------------------------------------------
# Post Chat History
# ----------------------------------------------------------------------
# @xray_recorder.capture("post_chat_history")
def post_chat_history(event):
    try:
        body = json.loads(event["body"])
        add_data = {
            PRIMARY_KEY: {"S": body["loginid"]},
            "content": {"L": []},
        }
        for chat in body["content"]:
            chat_item = {
                "M": {
                    "role": {"S": chat["role"]},
                    "message": {"S": chat["message"]},
                },
            }
            add_data["content"]["L"].append(chat_item)
        log.debug(f"add_data: {add_data}")
        # ChatHistoryが存在しない場合の新規追加
        try:
            response = dynamodb_client.put_item(
                TableName=DYNAMODB_TABLE,
                Item=add_data,
                ConditionExpression=f"attribute_not_exists({PRIMARY_KEY})",
            )
            log.debug("Item added successfully:", response)
        except dynamodb_client.exceptions.ConditionalCheckFailedException:
            log.debug("Item already exists.")
            # ChatHistoryが存在する場合の更新
            try:
                response = dynamodb_client.update_item(
                    TableName=DYNAMODB_TABLE,
                    Key={
                        PRIMARY_KEY: {
                            "S": body["loginid"],
                        },
                    },
                    UpdateExpression="SET content = :val1",
                    ExpressionAttributeValues={
                        ":val1": {
                            "L": add_data["content"]["L"],
                        },
                    },
                    ConditionExpression=f"attribute_exists({PRIMARY_KEY})",
                )
                log.debug("Item update successfully:", response)
            except Exception as e:
                log.error(f"エラーが発生しました: {e}")
                raise
        except Exception as e:
            log.error(f"エラーが発生しました: {e}")
            raise

        return response
    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise


# ----------------------------------------------------------------------
# Entry Point
# ----------------------------------------------------------------------
class ChatContent(TypedDict):
    role: str
    message: str


class History(TypedDict):
    loginid: str
    content: ChatContent[:]


# @xray_recorder.capture("lambda_handler")
def lambda_handler(event, context):
    try:
        log.debug(f"Event: {event}")
        response = main(event)
        return response
    except Exception as e:
        log.error(f"エラーが発生しました: {e}")
        raise
