"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Myblogv2Stack4 = void 0;
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const logs = require("aws-cdk-lib/aws-logs");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigwv2 = require("aws-cdk-lib/aws-apigatewayv2");
const aws_apigatewayv2_integrations_1 = require("aws-cdk-lib/aws-apigatewayv2-integrations");
const path = require("path");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const parameters4_1 = require("./parameters4");
const param = new parameters4_1.MyBlogParam4V2();
class Myblogv2Stack4 extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //////////////////////////////////////////////////
        /// Lambda                                     ///
        //////////////////////////////////////////////////
        ////////////
        /// Chat ///
        ////////////
        const lambdaRole = new iam.Role(this, param.lambda.roleName, {
            roleName: param.lambda.roleName,
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonBedrockFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccessV2"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonAPIGatewayAdministrator"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonAPIGatewayInvokeFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSESFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("SecretsManagerReadWrite")],
            inlinePolicies: {
                inlinePolicy: new iam.PolicyDocument({
                    statements: [
                        new iam.PolicyStatement({
                            effect: iam.Effect.ALLOW,
                            actions: ["transcribe:*"],
                            resources: ["*"],
                        }),
                    ],
                }),
            },
        });
        const lambdaLogGroupChat = new logs.LogGroup(this, param.lambda.logGroupName, {
            logGroupName: param.lambda.logGroupName,
            retention: logs.RetentionDays.ONE_DAY,
            logGroupClass: logs.LogGroupClass.STANDARD,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        const lambdaLayer = new lambda.LayerVersion(this, param.lambda.layerName, {
            layerVersionName: param.lambda.layerName,
            code: lambda.Code.fromAsset(path.join(__dirname, "../../lambda_code/layer/")),
            compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        const layerArn = '';
        const datadogLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'DatadogLayer', layerArn);
        const lambdaChat = new lambda.Function(this, param.lambda.functionName, {
            functionName: param.lambda.functionName,
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: "index.lambda_handler",
            role: lambdaRole,
            code: lambda.Code.fromAsset(path.join(__dirname, "../../lambda_code/chat2/")),
            timeout: aws_cdk_lib_1.Duration.minutes(15),
            logGroup: lambdaLogGroupChat,
            layers: [lambdaLayer, datadogLayer],
            environment: {
                DD_API_KEY: param.lambda.ddApiKey,
                DD_SITE: "ap1.datadoghq.com"
            },
            tracing: lambda.Tracing.ACTIVE,
        });
        //////////////////////////////////////////////////
        /// Step Functions                             ///
        //////////////////////////////////////////////////
        // const stepFunctionsRole = new iam.Role(this, param.stepFunctions.roleName, {
        //   roleName: param.stepFunctions.roleName,
        //   assumedBy: new iam.ServicePrincipal("states.amazonaws.com"),
        //   managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AWSLambda_FullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccessV2")],
        // });
        // const stepFunctionsLogGroup = new logs.LogGroup(this, param.stepFunctions.logGroupName, {
        //   logGroupName: param.stepFunctions.logGroupName,
        //   retention: logs.RetentionDays.ONE_DAY,
        //   logGroupClass: logs.LogGroupClass.STANDARD,
        //   removalPolicy: cdk.RemovalPolicy.DESTROY,
        // });
        // const firstTaskLambda = new sfntask.LambdaInvoke(this, "firstTask", {
        //   lambdaFunction: lambdaChat,
        // });
        // const success = new sfn.Succeed(this, "SuccessTask");
        // const definition = firstTaskLambda.next(success);
        // const stepFunctions = new sfn.StateMachine(this, param.stepFunctions.stateMachineName, {
        //   stateMachineName: param.stepFunctions.stateMachineName,
        //   tracingEnabled: true,
        //   timeout: Duration.minutes(5),
        //   removalPolicy: cdk.RemovalPolicy.DESTROY,
        //   logs: {
        //     level: sfn.LogLevel.ALL,
        //     destination: stepFunctionsLogGroup,
        //   },
        //   role: stepFunctionsRole,
        //   stateMachineType: sfn.StateMachineType.EXPRESS,
        //   definitionBody: sfn.DefinitionBody.fromChainable(definition),
        // });
        //////////////////////////////////////////////////
        /// API Gateway Websocket                      ///
        //////////////////////////////////////////////////
        // const apigatewaySfnRole = new iam.Role(this, param.websocket.roleName, {
        //   roleName: param.websocket.roleName,
        //   assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
        //   managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AWSStepFunctionsFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccessV2")],
        // });
        const webSocketApi = new apigwv2.WebSocketApi(this, param.websocket.apiName, {
            apiName: param.websocket.apiName,
            // コンソールから双方向通信を有効化することを忘れずに
            // defaultRouteOptions: {
            //   integration: new WebSocketAwsIntegration("StepFunctions", {
            //     integrationUri: `arn:aws:apigateway:${this.region}:states:action/StartSyncExecution`,
            //     integrationMethod: apigwv2.HttpMethod.POST,
            //     credentialsRole: apigatewaySfnRole,
            //     passthroughBehavior: apigwv2.PassthroughBehavior.WHEN_NO_TEMPLATES,
            //   }),
            // },
            defaultRouteOptions: {
                integration: new aws_apigatewayv2_integrations_1.WebSocketLambdaIntegration("connect", lambdaChat),
            },
            connectRouteOptions: {
                integration: new aws_apigatewayv2_integrations_1.WebSocketLambdaIntegration("connect", lambdaChat),
            },
            disconnectRouteOptions: {
                integration: new aws_apigatewayv2_integrations_1.WebSocketLambdaIntegration("disconnect", lambdaChat),
            },
        });
        const webSocketApiStage = new apigwv2.WebSocketStage(this, param.websocket.stageName, {
            webSocketApi,
            stageName: param.websocket.stageName,
            autoDeploy: true,
        });
        const defaultDomain = `${webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com`;
        new cdk.CfnOutput(this, "websocketDomainName", {
            exportName: "websocketDomainName",
            value: defaultDomain,
        });
    }
}
exports.Myblogv2Stack4 = Myblogv2Stack4;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2s0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9teWJsb2d2Mi1zdGFjazQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQyw2Q0FBNkM7QUFDN0MsaURBQWlEO0FBQ2pELHdEQUF3RDtBQUN4RCw2RkFBZ0g7QUFJaEgsNkJBQTZCO0FBRTdCLDZDQUF1QztBQUV2QywrQ0FBK0M7QUFFL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSw0QkFBYyxFQUFFLENBQUM7QUFFbkMsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QixrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxZQUFZO1FBQ1osWUFBWTtRQUNaLFlBQVk7UUFDWixNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQzNELFFBQVEsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDL0IsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO1lBQzNELGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMseUJBQXlCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLHdCQUF3QixDQUFDLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsMEJBQTBCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFD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Q0gsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFO1lBQ3BGLFlBQVk7WUFDWixTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTO1lBQ3BDLFVBQVUsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztRQUNILE1BQU0sYUFBYSxHQUFHLEdBQUcsWUFBWSxDQUFDLEtBQUssZ0JBQWdCLElBQUksQ0FBQyxNQUFNLGdCQUFnQixDQUFDO1FBQ3ZGLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDN0MsVUFBVSxFQUFFLHFCQUFxQjtZQUNqQyxLQUFLLEVBQUUsYUFBYTtTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUEvSEQsd0NBK0hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbG9nc1wiO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgKiBhcyBhcGlnd3YyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyXCI7XG5pbXBvcnQgeyBXZWJTb2NrZXRMYW1iZGFJbnRlZ3JhdGlvbiwgV2ViU29ja2V0QXdzSW50ZWdyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXl2Mi1pbnRlZ3JhdGlvbnNcIjtcbmltcG9ydCAqIGFzIHNmbiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXN0ZXBmdW5jdGlvbnNcIjtcbmltcG9ydCAqIGFzIHNmbnRhc2sgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zLXRhc2tzXCI7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuXG5pbXBvcnQgeyBNeUJsb2dQYXJhbTRWMiB9IGZyb20gXCIuL3BhcmFtZXRlcnM0XCI7XG5cbmNvbnN0IHBhcmFtID0gbmV3IE15QmxvZ1BhcmFtNFYyKCk7XG5cbmV4cG9ydCBjbGFzcyBNeWJsb2d2MlN0YWNrNCBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBMYW1iZGEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy9cbiAgICAvLy8gQ2hhdCAvLy9cbiAgICAvLy8vLy8vLy8vLy9cbiAgICBjb25zdCBsYW1iZGFSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsIHBhcmFtLmxhbWJkYS5yb2xlTmFtZSwge1xuICAgICAgcm9sZU5hbWU6IHBhcmFtLmxhbWJkYS5yb2xlTmFtZSxcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwibGFtYmRhLmFtYXpvbmF3cy5jb21cIiksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25CZWRyb2NrRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQ2xvdWRXYXRjaEZ1bGxBY2Nlc3NWMlwiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uUzNGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25EeW5hbW9EQkZ1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvbkFQSUdhdGV3YXlBZG1pbmlzdHJhdG9yXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25BUElHYXRld2F5SW52b2tlRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uU0VTRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiU2VjcmV0c01hbmFnZXJSZWFkV3JpdGVcIildLFxuICAgICAgaW5saW5lUG9saWNpZXM6IHtcbiAgICAgICAgaW5saW5lUG9saWN5OiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcbiAgICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgYWN0aW9uczogW1widHJhbnNjcmliZToqXCJdLFxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgbGFtYmRhTG9nR3JvdXBDaGF0ID0gbmV3IGxvZ3MuTG9nR3JvdXAodGhpcywgcGFyYW0ubGFtYmRhLmxvZ0dyb3VwTmFtZSwge1xuICAgICAgbG9nR3JvdXBOYW1lOiBwYXJhbS5sYW1iZGEubG9nR3JvdXBOYW1lLFxuICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAgIGxvZ0dyb3VwQ2xhc3M6IGxvZ3MuTG9nR3JvdXBDbGFzcy5TVEFOREFSRCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG4gICAgY29uc3QgbGFtYmRhTGF5ZXIgPSBuZXcgbGFtYmRhLkxheWVyVmVyc2lvbih0aGlzLCBwYXJhbS5sYW1iZGEubGF5ZXJOYW1lLCB7XG4gICAgICBsYXllclZlcnNpb25OYW1lOiBwYXJhbS5sYW1iZGEubGF5ZXJOYW1lLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vLi4vbGFtYmRhX2NvZGUvbGF5ZXIvXCIpKSxcbiAgICAgIGNvbXBhdGlibGVSdW50aW1lczogW2xhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzEyXSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG4gICAgY29uc3QgbGF5ZXJBcm4gPSAnYXJuOmF3czpsYW1iZGE6dXMtd2VzdC0yOjQ2NDYyMjUzMjAxMjpsYXllcjpEYXRhZG9nLVB5dGhvbjMxMjo5Nic7XG4gICAgY29uc3QgZGF0YWRvZ0xheWVyID0gbGFtYmRhLkxheWVyVmVyc2lvbi5mcm9tTGF5ZXJWZXJzaW9uQXJuKHRoaXMsICdEYXRhZG9nTGF5ZXInLCBsYXllckFybik7XG4gICAgY29uc3QgbGFtYmRhQ2hhdCA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgcGFyYW0ubGFtYmRhLmZ1bmN0aW9uTmFtZSwge1xuICAgICAgZnVuY3Rpb25OYW1lOiBwYXJhbS5sYW1iZGEuZnVuY3Rpb25OYW1lLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTIsXG4gICAgICBoYW5kbGVyOiBcImluZGV4LmxhbWJkYV9oYW5kbGVyXCIsXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vLi4vbGFtYmRhX2NvZGUvY2hhdDIvXCIpKSxcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLm1pbnV0ZXMoMTUpLFxuICAgICAgbG9nR3JvdXA6IGxhbWJkYUxvZ0dyb3VwQ2hhdCxcbiAgICAgIGxheWVyczogW2xhbWJkYUxheWVyLCBkYXRhZG9nTGF5ZXJdLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgRERfQVBJX0tFWTogcGFyYW0ubGFtYmRhLmRkQXBpS2V5LFxuICAgICAgICBERF9TSVRFOiBcImFwMS5kYXRhZG9naHEuY29tXCJcbiAgICAgIH0sXG4gICAgICB0cmFjaW5nOiBsYW1iZGEuVHJhY2luZy5BQ1RJVkUsXG4gICAgfSk7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gU3RlcCBGdW5jdGlvbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gY29uc3Qgc3RlcEZ1bmN0aW9uc1JvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgcGFyYW0uc3RlcEZ1bmN0aW9ucy5yb2xlTmFtZSwge1xuICAgIC8vICAgcm9sZU5hbWU6IHBhcmFtLnN0ZXBGdW5jdGlvbnMucm9sZU5hbWUsXG4gICAgLy8gICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcInN0YXRlcy5hbWF6b25hd3MuY29tXCIpLFxuICAgIC8vICAgbWFuYWdlZFBvbGljaWVzOiBbaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQVdTTGFtYmRhX0Z1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkNsb3VkV2F0Y2hGdWxsQWNjZXNzVjJcIildLFxuICAgIC8vIH0pO1xuICAgIC8vIGNvbnN0IHN0ZXBGdW5jdGlvbnNMb2dHcm91cCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsIHBhcmFtLnN0ZXBGdW5jdGlvbnMubG9nR3JvdXBOYW1lLCB7XG4gICAgLy8gICBsb2dHcm91cE5hbWU6IHBhcmFtLnN0ZXBGdW5jdGlvbnMubG9nR3JvdXBOYW1lLFxuICAgIC8vICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAvLyAgIGxvZ0dyb3VwQ2xhc3M6IGxvZ3MuTG9nR3JvdXBDbGFzcy5TVEFOREFSRCxcbiAgICAvLyAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgLy8gfSk7XG4gICAgLy8gY29uc3QgZmlyc3RUYXNrTGFtYmRhID0gbmV3IHNmbnRhc2suTGFtYmRhSW52b2tlKHRoaXMsIFwiZmlyc3RUYXNrXCIsIHtcbiAgICAvLyAgIGxhbWJkYUZ1bmN0aW9uOiBsYW1iZGFDaGF0LFxuICAgIC8vIH0pO1xuICAgIC8vIGNvbnN0IHN1Y2Nlc3MgPSBuZXcgc2ZuLlN1Y2NlZWQodGhpcywgXCJTdWNjZXNzVGFza1wiKTtcbiAgICAvLyBjb25zdCBkZWZpbml0aW9uID0gZmlyc3RUYXNrTGFtYmRhLm5leHQoc3VjY2Vzcyk7XG4gICAgLy8gY29uc3Qgc3RlcEZ1bmN0aW9ucyA9IG5ldyBzZm4uU3RhdGVNYWNoaW5lKHRoaXMsIHBhcmFtLnN0ZXBGdW5jdGlvbnMuc3RhdGVNYWNoaW5lTmFtZSwge1xuICAgIC8vICAgc3RhdGVNYWNoaW5lTmFtZTogcGFyYW0uc3RlcEZ1bmN0aW9ucy5zdGF0ZU1hY2hpbmVOYW1lLFxuICAgIC8vICAgdHJhY2luZ0VuYWJsZWQ6IHRydWUsXG4gICAgLy8gICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDUpLFxuICAgIC8vICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAvLyAgIGxvZ3M6IHtcbiAgICAvLyAgICAgbGV2ZWw6IHNmbi5Mb2dMZXZlbC5BTEwsXG4gICAgLy8gICAgIGRlc3RpbmF0aW9uOiBzdGVwRnVuY3Rpb25zTG9nR3JvdXAsXG4gICAgLy8gICB9LFxuICAgIC8vICAgcm9sZTogc3RlcEZ1bmN0aW9uc1JvbGUsXG4gICAgLy8gICBzdGF0ZU1hY2hpbmVUeXBlOiBzZm4uU3RhdGVNYWNoaW5lVHlwZS5FWFBSRVNTLFxuICAgIC8vICAgZGVmaW5pdGlvbkJvZHk6IHNmbi5EZWZpbml0aW9uQm9keS5mcm9tQ2hhaW5hYmxlKGRlZmluaXRpb24pLFxuICAgIC8vIH0pO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gQVBJIEdhdGV3YXkgV2Vic29ja2V0ICAgICAgICAgICAgICAgICAgICAgIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gY29uc3QgYXBpZ2F0ZXdheVNmblJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgcGFyYW0ud2Vic29ja2V0LnJvbGVOYW1lLCB7XG4gICAgLy8gICByb2xlTmFtZTogcGFyYW0ud2Vic29ja2V0LnJvbGVOYW1lLFxuICAgIC8vICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoXCJhcGlnYXRld2F5LmFtYXpvbmF3cy5jb21cIiksXG4gICAgLy8gICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NTdGVwRnVuY3Rpb25zRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQ2xvdWRXYXRjaEZ1bGxBY2Nlc3NWMlwiKV0sXG4gICAgLy8gfSk7XG4gICAgY29uc3Qgd2ViU29ja2V0QXBpID0gbmV3IGFwaWd3djIuV2ViU29ja2V0QXBpKHRoaXMsIHBhcmFtLndlYnNvY2tldC5hcGlOYW1lLCB7XG4gICAgICBhcGlOYW1lOiBwYXJhbS53ZWJzb2NrZXQuYXBpTmFtZSxcbiAgICAgIC8vIOOCs+ODs+OCveODvOODq+OBi+OCieWPjOaWueWQkemAmuS/oeOCkuacieWKueWMluOBmeOCi+OBk+OBqOOCkuW/mOOCjOOBmuOBq1xuICAgICAgLy8gZGVmYXVsdFJvdXRlT3B0aW9uczoge1xuICAgICAgLy8gICBpbnRlZ3JhdGlvbjogbmV3IFdlYlNvY2tldEF3c0ludGVncmF0aW9uKFwiU3RlcEZ1bmN0aW9uc1wiLCB7XG4gICAgICAvLyAgICAgaW50ZWdyYXRpb25Vcmk6IGBhcm46YXdzOmFwaWdhdGV3YXk6JHt0aGlzLnJlZ2lvbn06c3RhdGVzOmFjdGlvbi9TdGFydFN5bmNFeGVjdXRpb25gLFxuICAgICAgLy8gICAgIGludGVncmF0aW9uTWV0aG9kOiBhcGlnd3YyLkh0dHBNZXRob2QuUE9TVCxcbiAgICAgIC8vICAgICBjcmVkZW50aWFsc1JvbGU6IGFwaWdhdGV3YXlTZm5Sb2xlLFxuICAgICAgLy8gICAgIHBhc3N0aHJvdWdoQmVoYXZpb3I6IGFwaWd3djIuUGFzc3Rocm91Z2hCZWhhdmlvci5XSEVOX05PX1RFTVBMQVRFUyxcbiAgICAgIC8vICAgfSksXG4gICAgICAvLyB9LFxuICAgICAgZGVmYXVsdFJvdXRlT3B0aW9uczoge1xuICAgICAgICBpbnRlZ3JhdGlvbjogbmV3IFdlYlNvY2tldExhbWJkYUludGVncmF0aW9uKFwiY29ubmVjdFwiLCBsYW1iZGFDaGF0KSxcbiAgICAgIH0sXG4gICAgICBjb25uZWN0Um91dGVPcHRpb25zOiB7XG4gICAgICAgIGludGVncmF0aW9uOiBuZXcgV2ViU29ja2V0TGFtYmRhSW50ZWdyYXRpb24oXCJjb25uZWN0XCIsIGxhbWJkYUNoYXQpLFxuICAgICAgfSxcbiAgICAgIGRpc2Nvbm5lY3RSb3V0ZU9wdGlvbnM6IHtcbiAgICAgICAgaW50ZWdyYXRpb246IG5ldyBXZWJTb2NrZXRMYW1iZGFJbnRlZ3JhdGlvbihcImRpc2Nvbm5lY3RcIiwgbGFtYmRhQ2hhdCksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IHdlYlNvY2tldEFwaVN0YWdlID0gbmV3IGFwaWd3djIuV2ViU29ja2V0U3RhZ2UodGhpcywgcGFyYW0ud2Vic29ja2V0LnN0YWdlTmFtZSwge1xuICAgICAgd2ViU29ja2V0QXBpLFxuICAgICAgc3RhZ2VOYW1lOiBwYXJhbS53ZWJzb2NrZXQuc3RhZ2VOYW1lLFxuICAgICAgYXV0b0RlcGxveTogdHJ1ZSxcbiAgICB9KTtcbiAgICBjb25zdCBkZWZhdWx0RG9tYWluID0gYCR7d2ViU29ja2V0QXBpLmFwaUlkfS5leGVjdXRlLWFwaS4ke3RoaXMucmVnaW9ufS5hbWF6b25hd3MuY29tYDtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIndlYnNvY2tldERvbWFpbk5hbWVcIiwge1xuICAgICAgZXhwb3J0TmFtZTogXCJ3ZWJzb2NrZXREb21haW5OYW1lXCIsXG4gICAgICB2YWx1ZTogZGVmYXVsdERvbWFpbixcbiAgICB9KTtcbiAgfVxufVxuIl19