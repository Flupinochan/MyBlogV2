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
        // const layerArn = '';
        // const datadogLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'DatadogLayer', layerArn);
        const lambdaChat = new lambda.Function(this, param.lambda.functionName, {
            functionName: param.lambda.functionName,
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: "index.lambda_handler",
            role: lambdaRole,
            code: lambda.Code.fromAsset(path.join(__dirname, "../../lambda_code/chat2/")),
            timeout: aws_cdk_lib_1.Duration.minutes(15),
            logGroup: lambdaLogGroupChat,
            // layers: [lambdaLayer, datadogLayer],
            layers: [lambdaLayer],
            // environment: {
            //   DD_API_KEY: param.lambda.ddApiKey,
            //   DD_SITE: "ap1.datadoghq.com"
            // },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2s0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9teWJsb2d2Mi1zdGFjazQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQyw2Q0FBNkM7QUFDN0MsaURBQWlEO0FBQ2pELHdEQUF3RDtBQUN4RCw2RkFBZ0g7QUFJaEgsNkJBQTZCO0FBRTdCLDZDQUF1QztBQUV2QywrQ0FBK0M7QUFFL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSw0QkFBYyxFQUFFLENBQUM7QUFFbkMsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QixrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxZQUFZO1FBQ1osWUFBWTtRQUNaLFlBQVk7UUFDWixNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQzNELFFBQVEsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDL0IsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO1lBQzNELGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMseUJBQXlCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLHdCQUF3QixDQUFDLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsMEJBQTBCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFD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QyxTQUFTO1lBQ3BDLFVBQVUsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztRQUNILE1BQU0sYUFBYSxHQUFHLEdBQUcsWUFBWSxDQUFDLEtBQUssZ0JBQWdCLElBQUksQ0FBQyxNQUFNLGdCQUFnQixDQUFDO1FBQ3ZGLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDN0MsVUFBVSxFQUFFLHFCQUFxQjtZQUNqQyxLQUFLLEVBQUUsYUFBYTtTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFoSUQsd0NBZ0lDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbG9nc1wiO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XG5pbXBvcnQgKiBhcyBhcGlnd3YyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyXCI7XG5pbXBvcnQgeyBXZWJTb2NrZXRMYW1iZGFJbnRlZ3JhdGlvbiwgV2ViU29ja2V0QXdzSW50ZWdyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXl2Mi1pbnRlZ3JhdGlvbnNcIjtcbmltcG9ydCAqIGFzIHNmbiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXN0ZXBmdW5jdGlvbnNcIjtcbmltcG9ydCAqIGFzIHNmbnRhc2sgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zLXRhc2tzXCI7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuXG5pbXBvcnQgeyBNeUJsb2dQYXJhbTRWMiB9IGZyb20gXCIuL3BhcmFtZXRlcnM0XCI7XG5cbmNvbnN0IHBhcmFtID0gbmV3IE15QmxvZ1BhcmFtNFYyKCk7XG5cbmV4cG9ydCBjbGFzcyBNeWJsb2d2MlN0YWNrNCBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBMYW1iZGEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy9cbiAgICAvLy8gQ2hhdCAvLy9cbiAgICAvLy8vLy8vLy8vLy9cbiAgICBjb25zdCBsYW1iZGFSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsIHBhcmFtLmxhbWJkYS5yb2xlTmFtZSwge1xuICAgICAgcm9sZU5hbWU6IHBhcmFtLmxhbWJkYS5yb2xlTmFtZSxcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwibGFtYmRhLmFtYXpvbmF3cy5jb21cIiksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25CZWRyb2NrRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQ2xvdWRXYXRjaEZ1bGxBY2Nlc3NWMlwiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uUzNGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25EeW5hbW9EQkZ1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvbkFQSUdhdGV3YXlBZG1pbmlzdHJhdG9yXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25BUElHYXRld2F5SW52b2tlRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uU0VTRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiU2VjcmV0c01hbmFnZXJSZWFkV3JpdGVcIildLFxuICAgICAgaW5saW5lUG9saWNpZXM6IHtcbiAgICAgICAgaW5saW5lUG9saWN5OiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcbiAgICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgYWN0aW9uczogW1widHJhbnNjcmliZToqXCJdLFxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgbGFtYmRhTG9nR3JvdXBDaGF0ID0gbmV3IGxvZ3MuTG9nR3JvdXAodGhpcywgcGFyYW0ubGFtYmRhLmxvZ0dyb3VwTmFtZSwge1xuICAgICAgbG9nR3JvdXBOYW1lOiBwYXJhbS5sYW1iZGEubG9nR3JvdXBOYW1lLFxuICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAgIGxvZ0dyb3VwQ2xhc3M6IGxvZ3MuTG9nR3JvdXBDbGFzcy5TVEFOREFSRCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG4gICAgY29uc3QgbGFtYmRhTGF5ZXIgPSBuZXcgbGFtYmRhLkxheWVyVmVyc2lvbih0aGlzLCBwYXJhbS5sYW1iZGEubGF5ZXJOYW1lLCB7XG4gICAgICBsYXllclZlcnNpb25OYW1lOiBwYXJhbS5sYW1iZGEubGF5ZXJOYW1lLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vLi4vbGFtYmRhX2NvZGUvbGF5ZXIvXCIpKSxcbiAgICAgIGNvbXBhdGlibGVSdW50aW1lczogW2xhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzEyXSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG4gICAgLy8gY29uc3QgbGF5ZXJBcm4gPSAnJztcbiAgICAvLyBjb25zdCBkYXRhZG9nTGF5ZXIgPSBsYW1iZGEuTGF5ZXJWZXJzaW9uLmZyb21MYXllclZlcnNpb25Bcm4odGhpcywgJ0RhdGFkb2dMYXllcicsIGxheWVyQXJuKTtcbiAgICBjb25zdCBsYW1iZGFDaGF0ID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBwYXJhbS5sYW1iZGEuZnVuY3Rpb25OYW1lLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6IHBhcmFtLmxhbWJkYS5mdW5jdGlvbk5hbWUsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMixcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXgubGFtYmRhX2hhbmRsZXJcIixcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLi8uLi9sYW1iZGFfY29kZS9jaGF0Mi9cIikpLFxuICAgICAgdGltZW91dDogRHVyYXRpb24ubWludXRlcygxNSksXG4gICAgICBsb2dHcm91cDogbGFtYmRhTG9nR3JvdXBDaGF0LFxuICAgICAgLy8gbGF5ZXJzOiBbbGFtYmRhTGF5ZXIsIGRhdGFkb2dMYXllcl0sXG4gICAgICBsYXllcnM6IFtsYW1iZGFMYXllcl0sXG4gICAgICAvLyBlbnZpcm9ubWVudDoge1xuICAgICAgLy8gICBERF9BUElfS0VZOiBwYXJhbS5sYW1iZGEuZGRBcGlLZXksXG4gICAgICAvLyAgIEREX1NJVEU6IFwiYXAxLmRhdGFkb2docS5jb21cIlxuICAgICAgLy8gfSxcbiAgICAgIHRyYWNpbmc6IGxhbWJkYS5UcmFjaW5nLkFDVElWRSxcbiAgICB9KTtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBTdGVwIEZ1bmN0aW9ucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBjb25zdCBzdGVwRnVuY3Rpb25zUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBwYXJhbS5zdGVwRnVuY3Rpb25zLnJvbGVOYW1lLCB7XG4gICAgLy8gICByb2xlTmFtZTogcGFyYW0uc3RlcEZ1bmN0aW9ucy5yb2xlTmFtZSxcbiAgICAvLyAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwic3RhdGVzLmFtYXpvbmF3cy5jb21cIiksXG4gICAgLy8gICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NMYW1iZGFfRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQ2xvdWRXYXRjaEZ1bGxBY2Nlc3NWMlwiKV0sXG4gICAgLy8gfSk7XG4gICAgLy8gY29uc3Qgc3RlcEZ1bmN0aW9uc0xvZ0dyb3VwID0gbmV3IGxvZ3MuTG9nR3JvdXAodGhpcywgcGFyYW0uc3RlcEZ1bmN0aW9ucy5sb2dHcm91cE5hbWUsIHtcbiAgICAvLyAgIGxvZ0dyb3VwTmFtZTogcGFyYW0uc3RlcEZ1bmN0aW9ucy5sb2dHcm91cE5hbWUsXG4gICAgLy8gICByZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfREFZLFxuICAgIC8vICAgbG9nR3JvdXBDbGFzczogbG9ncy5Mb2dHcm91cENsYXNzLlNUQU5EQVJELFxuICAgIC8vICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAvLyB9KTtcbiAgICAvLyBjb25zdCBmaXJzdFRhc2tMYW1iZGEgPSBuZXcgc2ZudGFzay5MYW1iZGFJbnZva2UodGhpcywgXCJmaXJzdFRhc2tcIiwge1xuICAgIC8vICAgbGFtYmRhRnVuY3Rpb246IGxhbWJkYUNoYXQsXG4gICAgLy8gfSk7XG4gICAgLy8gY29uc3Qgc3VjY2VzcyA9IG5ldyBzZm4uU3VjY2VlZCh0aGlzLCBcIlN1Y2Nlc3NUYXNrXCIpO1xuICAgIC8vIGNvbnN0IGRlZmluaXRpb24gPSBmaXJzdFRhc2tMYW1iZGEubmV4dChzdWNjZXNzKTtcbiAgICAvLyBjb25zdCBzdGVwRnVuY3Rpb25zID0gbmV3IHNmbi5TdGF0ZU1hY2hpbmUodGhpcywgcGFyYW0uc3RlcEZ1bmN0aW9ucy5zdGF0ZU1hY2hpbmVOYW1lLCB7XG4gICAgLy8gICBzdGF0ZU1hY2hpbmVOYW1lOiBwYXJhbS5zdGVwRnVuY3Rpb25zLnN0YXRlTWFjaGluZU5hbWUsXG4gICAgLy8gICB0cmFjaW5nRW5hYmxlZDogdHJ1ZSxcbiAgICAvLyAgIHRpbWVvdXQ6IER1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgLy8gICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIC8vICAgbG9nczoge1xuICAgIC8vICAgICBsZXZlbDogc2ZuLkxvZ0xldmVsLkFMTCxcbiAgICAvLyAgICAgZGVzdGluYXRpb246IHN0ZXBGdW5jdGlvbnNMb2dHcm91cCxcbiAgICAvLyAgIH0sXG4gICAgLy8gICByb2xlOiBzdGVwRnVuY3Rpb25zUm9sZSxcbiAgICAvLyAgIHN0YXRlTWFjaGluZVR5cGU6IHNmbi5TdGF0ZU1hY2hpbmVUeXBlLkVYUFJFU1MsXG4gICAgLy8gICBkZWZpbml0aW9uQm9keTogc2ZuLkRlZmluaXRpb25Cb2R5LmZyb21DaGFpbmFibGUoZGVmaW5pdGlvbiksXG4gICAgLy8gfSk7XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBBUEkgR2F0ZXdheSBXZWJzb2NrZXQgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBjb25zdCBhcGlnYXRld2F5U2ZuUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBwYXJhbS53ZWJzb2NrZXQucm9sZU5hbWUsIHtcbiAgICAvLyAgIHJvbGVOYW1lOiBwYXJhbS53ZWJzb2NrZXQucm9sZU5hbWUsXG4gICAgLy8gICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImFwaWdhdGV3YXkuYW1hem9uYXdzLmNvbVwiKSxcbiAgICAvLyAgIG1hbmFnZWRQb2xpY2llczogW2lhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFXU1N0ZXBGdW5jdGlvbnNGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJDbG91ZFdhdGNoRnVsbEFjY2Vzc1YyXCIpXSxcbiAgICAvLyB9KTtcbiAgICBjb25zdCB3ZWJTb2NrZXRBcGkgPSBuZXcgYXBpZ3d2Mi5XZWJTb2NrZXRBcGkodGhpcywgcGFyYW0ud2Vic29ja2V0LmFwaU5hbWUsIHtcbiAgICAgIGFwaU5hbWU6IHBhcmFtLndlYnNvY2tldC5hcGlOYW1lLFxuICAgICAgLy8g44Kz44Oz44K944O844Or44GL44KJ5Y+M5pa55ZCR6YCa5L+h44KS5pyJ5Yq55YyW44GZ44KL44GT44Go44KS5b+Y44KM44Ga44GrXG4gICAgICAvLyBkZWZhdWx0Um91dGVPcHRpb25zOiB7XG4gICAgICAvLyAgIGludGVncmF0aW9uOiBuZXcgV2ViU29ja2V0QXdzSW50ZWdyYXRpb24oXCJTdGVwRnVuY3Rpb25zXCIsIHtcbiAgICAgIC8vICAgICBpbnRlZ3JhdGlvblVyaTogYGFybjphd3M6YXBpZ2F0ZXdheToke3RoaXMucmVnaW9ufTpzdGF0ZXM6YWN0aW9uL1N0YXJ0U3luY0V4ZWN1dGlvbmAsXG4gICAgICAvLyAgICAgaW50ZWdyYXRpb25NZXRob2Q6IGFwaWd3djIuSHR0cE1ldGhvZC5QT1NULFxuICAgICAgLy8gICAgIGNyZWRlbnRpYWxzUm9sZTogYXBpZ2F0ZXdheVNmblJvbGUsXG4gICAgICAvLyAgICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogYXBpZ3d2Mi5QYXNzdGhyb3VnaEJlaGF2aW9yLldIRU5fTk9fVEVNUExBVEVTLFxuICAgICAgLy8gICB9KSxcbiAgICAgIC8vIH0sXG4gICAgICBkZWZhdWx0Um91dGVPcHRpb25zOiB7XG4gICAgICAgIGludGVncmF0aW9uOiBuZXcgV2ViU29ja2V0TGFtYmRhSW50ZWdyYXRpb24oXCJjb25uZWN0XCIsIGxhbWJkYUNoYXQpLFxuICAgICAgfSxcbiAgICAgIGNvbm5lY3RSb3V0ZU9wdGlvbnM6IHtcbiAgICAgICAgaW50ZWdyYXRpb246IG5ldyBXZWJTb2NrZXRMYW1iZGFJbnRlZ3JhdGlvbihcImNvbm5lY3RcIiwgbGFtYmRhQ2hhdCksXG4gICAgICB9LFxuICAgICAgZGlzY29ubmVjdFJvdXRlT3B0aW9uczoge1xuICAgICAgICBpbnRlZ3JhdGlvbjogbmV3IFdlYlNvY2tldExhbWJkYUludGVncmF0aW9uKFwiZGlzY29ubmVjdFwiLCBsYW1iZGFDaGF0KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3Qgd2ViU29ja2V0QXBpU3RhZ2UgPSBuZXcgYXBpZ3d2Mi5XZWJTb2NrZXRTdGFnZSh0aGlzLCBwYXJhbS53ZWJzb2NrZXQuc3RhZ2VOYW1lLCB7XG4gICAgICB3ZWJTb2NrZXRBcGksXG4gICAgICBzdGFnZU5hbWU6IHBhcmFtLndlYnNvY2tldC5zdGFnZU5hbWUsXG4gICAgICBhdXRvRGVwbG95OiB0cnVlLFxuICAgIH0pO1xuICAgIGNvbnN0IGRlZmF1bHREb21haW4gPSBgJHt3ZWJTb2NrZXRBcGkuYXBpSWR9LmV4ZWN1dGUtYXBpLiR7dGhpcy5yZWdpb259LmFtYXpvbmF3cy5jb21gO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwid2Vic29ja2V0RG9tYWluTmFtZVwiLCB7XG4gICAgICBleHBvcnROYW1lOiBcIndlYnNvY2tldERvbWFpbk5hbWVcIixcbiAgICAgIHZhbHVlOiBkZWZhdWx0RG9tYWluLFxuICAgIH0pO1xuICB9XG59XG4iXX0=