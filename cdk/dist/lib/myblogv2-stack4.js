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
        const lambdaChat = new lambda.Function(this, param.lambda.functionName, {
            functionName: param.lambda.functionName,
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: "index.lambda_handler",
            role: lambdaRole,
            code: lambda.Code.fromAsset(path.join(__dirname, "../../lambda_code/chat2/")),
            timeout: aws_cdk_lib_1.Duration.minutes(15),
            logGroup: lambdaLogGroupChat,
            layers: [lambdaLayer],
            environment: {
                BUCKET_NAME: "test",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2s0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9teWJsb2d2Mi1zdGFjazQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQyw2Q0FBNkM7QUFDN0MsaURBQWlEO0FBQ2pELHdEQUF3RDtBQUN4RCw2RkFBZ0g7QUFJaEgsNkJBQTZCO0FBRTdCLDZDQUF1QztBQUV2QywrQ0FBK0M7QUFFL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSw0QkFBYyxFQUFFLENBQUM7QUFFbkMsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QixrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxZQUFZO1FBQ1osWUFBWTtRQUNaLFlBQVk7UUFDWixNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQzNELFFBQVEsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDL0IsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO1lBQzNELGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMseUJBQXlCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLHdCQUF3QixDQUFDLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsMEJBQTBCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFD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Q0gsTUFBTSxhQUFhLEdBQUcsR0FBRyxZQUFZLENBQUMsS0FBSyxnQkFBZ0IsSUFBSSxDQUFDLE1BQU0sZ0JBQWdCLENBQUM7UUFDdkYsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUM3QyxVQUFVLEVBQUUscUJBQXFCO1lBQ2pDLEtBQUssRUFBRSxhQUFhO1NBQ3JCLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTVIRCx3Q0E0SEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sb2dzXCI7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGFcIjtcbmltcG9ydCAqIGFzIGFwaWd3djIgZnJvbSBcImF3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5djJcIjtcbmltcG9ydCB7IFdlYlNvY2tldExhbWJkYUludGVncmF0aW9uLCBXZWJTb2NrZXRBd3NJbnRlZ3JhdGlvbiB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyLWludGVncmF0aW9uc1wiO1xuaW1wb3J0ICogYXMgc2ZuIGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mtc3RlcGZ1bmN0aW9uc1wiO1xuaW1wb3J0ICogYXMgc2ZudGFzayBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXN0ZXBmdW5jdGlvbnMtdGFza3NcIjtcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5cbmltcG9ydCB7IE15QmxvZ1BhcmFtNFYyIH0gZnJvbSBcIi4vcGFyYW1ldGVyczRcIjtcblxuY29uc3QgcGFyYW0gPSBuZXcgTXlCbG9nUGFyYW00VjIoKTtcblxuZXhwb3J0IGNsYXNzIE15YmxvZ3YyU3RhY2s0IGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vIExhbWJkYSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLy8vLy8vLy8vL1xuICAgIC8vLyBDaGF0IC8vL1xuICAgIC8vLy8vLy8vLy8vL1xuICAgIGNvbnN0IGxhbWJkYVJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgcGFyYW0ubGFtYmRhLnJvbGVOYW1lLCB7XG4gICAgICByb2xlTmFtZTogcGFyYW0ubGFtYmRhLnJvbGVOYW1lLFxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoXCJsYW1iZGEuYW1hem9uYXdzLmNvbVwiKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW2lhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvbkJlZHJvY2tGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJDbG91ZFdhdGNoRnVsbEFjY2Vzc1YyXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25TM0Z1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvbkR5bmFtb0RCRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uQVBJR2F0ZXdheUFkbWluaXN0cmF0b3JcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvbkFQSUdhdGV3YXlJbnZva2VGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25TRVNGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJTZWNyZXRzTWFuYWdlclJlYWRXcml0ZVwiKV0sXG4gICAgICBpbmxpbmVQb2xpY2llczoge1xuICAgICAgICBpbmxpbmVQb2xpY3k6IG5ldyBpYW0uUG9saWN5RG9jdW1lbnQoe1xuICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXCJ0cmFuc2NyaWJlOipcIl0sXG4gICAgICAgICAgICAgIHJlc291cmNlczogW1wiKlwiXSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBsYW1iZGFMb2dHcm91cENoYXQgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCBwYXJhbS5sYW1iZGEubG9nR3JvdXBOYW1lLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IHBhcmFtLmxhbWJkYS5sb2dHcm91cE5hbWUsXG4gICAgICByZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfREFZLFxuICAgICAgbG9nR3JvdXBDbGFzczogbG9ncy5Mb2dHcm91cENsYXNzLlNUQU5EQVJELFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcbiAgICBjb25zdCBsYW1iZGFMYXllciA9IG5ldyBsYW1iZGEuTGF5ZXJWZXJzaW9uKHRoaXMsIHBhcmFtLmxhbWJkYS5sYXllck5hbWUsIHtcbiAgICAgIGxheWVyVmVyc2lvbk5hbWU6IHBhcmFtLmxhbWJkYS5sYXllck5hbWUsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLi8uLi9sYW1iZGFfY29kZS9sYXllci9cIikpLFxuICAgICAgY29tcGF0aWJsZVJ1bnRpbWVzOiBbbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTJdLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICB9KTtcbiAgICBjb25zdCBsYW1iZGFDaGF0ID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBwYXJhbS5sYW1iZGEuZnVuY3Rpb25OYW1lLCB7XG4gICAgICBmdW5jdGlvbk5hbWU6IHBhcmFtLmxhbWJkYS5mdW5jdGlvbk5hbWUsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMixcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXgubGFtYmRhX2hhbmRsZXJcIixcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLi8uLi9sYW1iZGFfY29kZS9jaGF0Mi9cIikpLFxuICAgICAgdGltZW91dDogRHVyYXRpb24ubWludXRlcygxNSksXG4gICAgICBsb2dHcm91cDogbGFtYmRhTG9nR3JvdXBDaGF0LFxuICAgICAgbGF5ZXJzOiBbbGFtYmRhTGF5ZXJdLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQlVDS0VUX05BTUU6IFwidGVzdFwiLFxuICAgICAgfSxcbiAgICAgIHRyYWNpbmc6IGxhbWJkYS5UcmFjaW5nLkFDVElWRSxcbiAgICB9KTtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBTdGVwIEZ1bmN0aW9ucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBjb25zdCBzdGVwRnVuY3Rpb25zUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBwYXJhbS5zdGVwRnVuY3Rpb25zLnJvbGVOYW1lLCB7XG4gICAgLy8gICByb2xlTmFtZTogcGFyYW0uc3RlcEZ1bmN0aW9ucy5yb2xlTmFtZSxcbiAgICAvLyAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwic3RhdGVzLmFtYXpvbmF3cy5jb21cIiksXG4gICAgLy8gICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NMYW1iZGFfRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQ2xvdWRXYXRjaEZ1bGxBY2Nlc3NWMlwiKV0sXG4gICAgLy8gfSk7XG4gICAgLy8gY29uc3Qgc3RlcEZ1bmN0aW9uc0xvZ0dyb3VwID0gbmV3IGxvZ3MuTG9nR3JvdXAodGhpcywgcGFyYW0uc3RlcEZ1bmN0aW9ucy5sb2dHcm91cE5hbWUsIHtcbiAgICAvLyAgIGxvZ0dyb3VwTmFtZTogcGFyYW0uc3RlcEZ1bmN0aW9ucy5sb2dHcm91cE5hbWUsXG4gICAgLy8gICByZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfREFZLFxuICAgIC8vICAgbG9nR3JvdXBDbGFzczogbG9ncy5Mb2dHcm91cENsYXNzLlNUQU5EQVJELFxuICAgIC8vICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAvLyB9KTtcbiAgICAvLyBjb25zdCBmaXJzdFRhc2tMYW1iZGEgPSBuZXcgc2ZudGFzay5MYW1iZGFJbnZva2UodGhpcywgXCJmaXJzdFRhc2tcIiwge1xuICAgIC8vICAgbGFtYmRhRnVuY3Rpb246IGxhbWJkYUNoYXQsXG4gICAgLy8gfSk7XG4gICAgLy8gY29uc3Qgc3VjY2VzcyA9IG5ldyBzZm4uU3VjY2VlZCh0aGlzLCBcIlN1Y2Nlc3NUYXNrXCIpO1xuICAgIC8vIGNvbnN0IGRlZmluaXRpb24gPSBmaXJzdFRhc2tMYW1iZGEubmV4dChzdWNjZXNzKTtcbiAgICAvLyBjb25zdCBzdGVwRnVuY3Rpb25zID0gbmV3IHNmbi5TdGF0ZU1hY2hpbmUodGhpcywgcGFyYW0uc3RlcEZ1bmN0aW9ucy5zdGF0ZU1hY2hpbmVOYW1lLCB7XG4gICAgLy8gICBzdGF0ZU1hY2hpbmVOYW1lOiBwYXJhbS5zdGVwRnVuY3Rpb25zLnN0YXRlTWFjaGluZU5hbWUsXG4gICAgLy8gICB0cmFjaW5nRW5hYmxlZDogdHJ1ZSxcbiAgICAvLyAgIHRpbWVvdXQ6IER1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgLy8gICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIC8vICAgbG9nczoge1xuICAgIC8vICAgICBsZXZlbDogc2ZuLkxvZ0xldmVsLkFMTCxcbiAgICAvLyAgICAgZGVzdGluYXRpb246IHN0ZXBGdW5jdGlvbnNMb2dHcm91cCxcbiAgICAvLyAgIH0sXG4gICAgLy8gICByb2xlOiBzdGVwRnVuY3Rpb25zUm9sZSxcbiAgICAvLyAgIHN0YXRlTWFjaGluZVR5cGU6IHNmbi5TdGF0ZU1hY2hpbmVUeXBlLkVYUFJFU1MsXG4gICAgLy8gICBkZWZpbml0aW9uQm9keTogc2ZuLkRlZmluaXRpb25Cb2R5LmZyb21DaGFpbmFibGUoZGVmaW5pdGlvbiksXG4gICAgLy8gfSk7XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBBUEkgR2F0ZXdheSBXZWJzb2NrZXQgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBjb25zdCBhcGlnYXRld2F5U2ZuUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBwYXJhbS53ZWJzb2NrZXQucm9sZU5hbWUsIHtcbiAgICAvLyAgIHJvbGVOYW1lOiBwYXJhbS53ZWJzb2NrZXQucm9sZU5hbWUsXG4gICAgLy8gICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImFwaWdhdGV3YXkuYW1hem9uYXdzLmNvbVwiKSxcbiAgICAvLyAgIG1hbmFnZWRQb2xpY2llczogW2lhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFXU1N0ZXBGdW5jdGlvbnNGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJDbG91ZFdhdGNoRnVsbEFjY2Vzc1YyXCIpXSxcbiAgICAvLyB9KTtcbiAgICBjb25zdCB3ZWJTb2NrZXRBcGkgPSBuZXcgYXBpZ3d2Mi5XZWJTb2NrZXRBcGkodGhpcywgcGFyYW0ud2Vic29ja2V0LmFwaU5hbWUsIHtcbiAgICAgIGFwaU5hbWU6IHBhcmFtLndlYnNvY2tldC5hcGlOYW1lLFxuICAgICAgLy8g44Kz44Oz44K944O844Or44GL44KJ5Y+M5pa55ZCR6YCa5L+h44KS5pyJ5Yq55YyW44GZ44KL44GT44Go44KS5b+Y44KM44Ga44GrXG4gICAgICAvLyBkZWZhdWx0Um91dGVPcHRpb25zOiB7XG4gICAgICAvLyAgIGludGVncmF0aW9uOiBuZXcgV2ViU29ja2V0QXdzSW50ZWdyYXRpb24oXCJTdGVwRnVuY3Rpb25zXCIsIHtcbiAgICAgIC8vICAgICBpbnRlZ3JhdGlvblVyaTogYGFybjphd3M6YXBpZ2F0ZXdheToke3RoaXMucmVnaW9ufTpzdGF0ZXM6YWN0aW9uL1N0YXJ0U3luY0V4ZWN1dGlvbmAsXG4gICAgICAvLyAgICAgaW50ZWdyYXRpb25NZXRob2Q6IGFwaWd3djIuSHR0cE1ldGhvZC5QT1NULFxuICAgICAgLy8gICAgIGNyZWRlbnRpYWxzUm9sZTogYXBpZ2F0ZXdheVNmblJvbGUsXG4gICAgICAvLyAgICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogYXBpZ3d2Mi5QYXNzdGhyb3VnaEJlaGF2aW9yLldIRU5fTk9fVEVNUExBVEVTLFxuICAgICAgLy8gICB9KSxcbiAgICAgIC8vIH0sXG4gICAgICBkZWZhdWx0Um91dGVPcHRpb25zOiB7XG4gICAgICAgIGludGVncmF0aW9uOiBuZXcgV2ViU29ja2V0TGFtYmRhSW50ZWdyYXRpb24oXCJjb25uZWN0XCIsIGxhbWJkYUNoYXQpLFxuICAgICAgfSxcbiAgICAgIGNvbm5lY3RSb3V0ZU9wdGlvbnM6IHtcbiAgICAgICAgaW50ZWdyYXRpb246IG5ldyBXZWJTb2NrZXRMYW1iZGFJbnRlZ3JhdGlvbihcImNvbm5lY3RcIiwgbGFtYmRhQ2hhdCksXG4gICAgICB9LFxuICAgICAgZGlzY29ubmVjdFJvdXRlT3B0aW9uczoge1xuICAgICAgICBpbnRlZ3JhdGlvbjogbmV3IFdlYlNvY2tldExhbWJkYUludGVncmF0aW9uKFwiZGlzY29ubmVjdFwiLCBsYW1iZGFDaGF0KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3Qgd2ViU29ja2V0QXBpU3RhZ2UgPSBuZXcgYXBpZ3d2Mi5XZWJTb2NrZXRTdGFnZSh0aGlzLCBwYXJhbS53ZWJzb2NrZXQuc3RhZ2VOYW1lLCB7XG4gICAgICB3ZWJTb2NrZXRBcGksXG4gICAgICBzdGFnZU5hbWU6IHBhcmFtLndlYnNvY2tldC5zdGFnZU5hbWUsXG4gICAgICBhdXRvRGVwbG95OiB0cnVlLFxuICAgIH0pO1xuICAgIGNvbnN0IGRlZmF1bHREb21haW4gPSBgJHt3ZWJTb2NrZXRBcGkuYXBpSWR9LmV4ZWN1dGUtYXBpLiR7dGhpcy5yZWdpb259LmFtYXpvbmF3cy5jb21gO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwid2Vic29ja2V0RG9tYWluTmFtZVwiLCB7XG4gICAgICBleHBvcnROYW1lOiBcIndlYnNvY2tldERvbWFpbk5hbWVcIixcbiAgICAgIHZhbHVlOiBkZWZhdWx0RG9tYWluLFxuICAgIH0pO1xuICB9XG59XG4iXX0=