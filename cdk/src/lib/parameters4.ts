export class MyBlogParam4V2 {
  lambda = {
    functionName: "metalmental-myblogv2-websocket-lambda",
    roleName: "metalmental-myblogv2-websocket-lambda-role",
    logGroupName: "metalmental-myblogv2-websocket-lambda-logs",
    layerName: "metalmental-myblogv2-websocket-lambda-layer",
    // ddApiKey: "",
  };
  stepFunctions = {
    stateMachineName: "metalmental-myblogv2-websocket-sfn",
    roleName: "metalmental-myblogv2-websocket-sfn-role",
    logGroupName: "metalmental-myblogv2-websocket-sfn-logs",
  };
  websocket = {
    apiName: "metalmental-myblogv2-websocket-api",
    stageName: "websocket",
    roleName: "metalmental-myblogv2-websocket-api-role",
  };
}
