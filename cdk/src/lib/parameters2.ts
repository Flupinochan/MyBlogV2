export class MyBlogParam2V2 {
  lambda = {
    functionName: "metalmental-myblogv2-lambda-chat",
    logGroupName: "metalmental-myblogv2-lambda-logs-chat",
    roleName: "metalmental-myblogv2-lambda-role-chat",
    layerName: "metalmental-myblogv2-lambda-layer-chat",
    functionName2: "metalmental-myblogv2-websocket-lambda-db",
    logGroupName2: "metalmental-myblogv2-websocket-lambda-logs-db",
  };
  apiGateway = {
    logGroupName: "metalmental-myblogv2-apigw-logs",
    apiName: "metalmental-myblogv2-apigw",
  };
  dynamodb = {
    tableName: "metalmental-myblogv2-db",
    primaryKeyName: "id",
  }
}
