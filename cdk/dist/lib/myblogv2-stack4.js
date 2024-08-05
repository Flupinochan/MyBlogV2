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
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonBedrockFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccessV2"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonAPIGatewayAdministrator"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonAPIGatewayInvokeFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSESFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("SecretsManagerReadWrite"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSESFullAccess")],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2s0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9teWJsb2d2Mi1zdGFjazQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQyw2Q0FBNkM7QUFDN0MsaURBQWlEO0FBQ2pELHdEQUF3RDtBQUN4RCw2RkFBZ0g7QUFJaEgsNkJBQTZCO0FBRTdCLDZDQUF1QztBQUV2QywrQ0FBK0M7QUFFL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSw0QkFBYyxFQUFFLENBQUM7QUFFbkMsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QixrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxZQUFZO1FBQ1osWUFBWTtRQUNaLFlBQVk7UUFDWixNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQzNELFFBQVEsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDL0IsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO1lBQzNELGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMseUJBQXlCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLHdCQUF3QixDQUFDLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsMEJBQTBCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFD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RUFBRTtZQUNwRixZQUFZO1lBQ1osU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUztZQUNwQyxVQUFVLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7UUFDSCxNQUFNLGFBQWEsR0FBRyxHQUFHLFlBQVksQ0FBQyxLQUFLLGdCQUFnQixJQUFJLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQztRQUN2RixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFO1lBQzdDLFVBQVUsRUFBRSxxQkFBcUI7WUFDakMsS0FBSyxFQUFFLGFBQWE7U0FDckIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBaElELHdDQWdJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxvZ3NcIjtcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xuaW1wb3J0ICogYXMgYXBpZ3d2MiBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXl2MlwiO1xuaW1wb3J0IHsgV2ViU29ja2V0TGFtYmRhSW50ZWdyYXRpb24sIFdlYlNvY2tldEF3c0ludGVncmF0aW9uIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5djItaW50ZWdyYXRpb25zXCI7XG5pbXBvcnQgKiBhcyBzZm4gZnJvbSBcImF3cy1jZGstbGliL2F3cy1zdGVwZnVuY3Rpb25zXCI7XG5pbXBvcnQgKiBhcyBzZm50YXNrIGZyb20gXCJhd3MtY2RrLWxpYi9hd3Mtc3RlcGZ1bmN0aW9ucy10YXNrc1wiO1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcblxuaW1wb3J0IHsgTXlCbG9nUGFyYW00VjIgfSBmcm9tIFwiLi9wYXJhbWV0ZXJzNFwiO1xuXG5jb25zdCBwYXJhbSA9IG5ldyBNeUJsb2dQYXJhbTRWMigpO1xuXG5leHBvcnQgY2xhc3MgTXlibG9ndjJTdGFjazQgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gTGFtYmRhICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vXG4gICAgLy8vIENoYXQgLy8vXG4gICAgLy8vLy8vLy8vLy8vXG4gICAgY29uc3QgbGFtYmRhUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBwYXJhbS5sYW1iZGEucm9sZU5hbWUsIHtcbiAgICAgIHJvbGVOYW1lOiBwYXJhbS5sYW1iZGEucm9sZU5hbWUsXG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImxhbWJkYS5hbWF6b25hd3MuY29tXCIpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uQmVkcm9ja0Z1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkNsb3VkV2F0Y2hGdWxsQWNjZXNzVjJcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblMzRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uRHluYW1vREJGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25BUElHYXRld2F5QWRtaW5pc3RyYXRvclwiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uQVBJR2F0ZXdheUludm9rZUZ1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblNFU0Z1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIlNlY3JldHNNYW5hZ2VyUmVhZFdyaXRlXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25TRVNGdWxsQWNjZXNzXCIpXSxcbiAgICAgIGlubGluZVBvbGljaWVzOiB7XG4gICAgICAgIGlubGluZVBvbGljeTogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcInRyYW5zY3JpYmU6KlwiXSxcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXCIqXCJdLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgXSxcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGxhbWJkYUxvZ0dyb3VwQ2hhdCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsIHBhcmFtLmxhbWJkYS5sb2dHcm91cE5hbWUsIHtcbiAgICAgIGxvZ0dyb3VwTmFtZTogcGFyYW0ubGFtYmRhLmxvZ0dyb3VwTmFtZSxcbiAgICAgIHJldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9EQVksXG4gICAgICBsb2dHcm91cENsYXNzOiBsb2dzLkxvZ0dyb3VwQ2xhc3MuU1RBTkRBUkQsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhbWJkYUxheWVyID0gbmV3IGxhbWJkYS5MYXllclZlcnNpb24odGhpcywgcGFyYW0ubGFtYmRhLmxheWVyTmFtZSwge1xuICAgICAgbGF5ZXJWZXJzaW9uTmFtZTogcGFyYW0ubGFtYmRhLmxheWVyTmFtZSxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uLy4uL2xhbWJkYV9jb2RlL2xheWVyL1wiKSksXG4gICAgICBjb21wYXRpYmxlUnVudGltZXM6IFtsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMl0sXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuICAgIC8vIGNvbnN0IGxheWVyQXJuID0gJyc7XG4gICAgLy8gY29uc3QgZGF0YWRvZ0xheWVyID0gbGFtYmRhLkxheWVyVmVyc2lvbi5mcm9tTGF5ZXJWZXJzaW9uQXJuKHRoaXMsICdEYXRhZG9nTGF5ZXInLCBsYXllckFybik7XG4gICAgY29uc3QgbGFtYmRhQ2hhdCA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgcGFyYW0ubGFtYmRhLmZ1bmN0aW9uTmFtZSwge1xuICAgICAgZnVuY3Rpb25OYW1lOiBwYXJhbS5sYW1iZGEuZnVuY3Rpb25OYW1lLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTIsXG4gICAgICBoYW5kbGVyOiBcImluZGV4LmxhbWJkYV9oYW5kbGVyXCIsXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vLi4vbGFtYmRhX2NvZGUvY2hhdDIvXCIpKSxcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLm1pbnV0ZXMoMTUpLFxuICAgICAgbG9nR3JvdXA6IGxhbWJkYUxvZ0dyb3VwQ2hhdCxcbiAgICAgIC8vIGxheWVyczogW2xhbWJkYUxheWVyLCBkYXRhZG9nTGF5ZXJdLFxuICAgICAgbGF5ZXJzOiBbbGFtYmRhTGF5ZXJdLFxuICAgICAgLy8gZW52aXJvbm1lbnQ6IHtcbiAgICAgIC8vICAgRERfQVBJX0tFWTogcGFyYW0ubGFtYmRhLmRkQXBpS2V5LFxuICAgICAgLy8gICBERF9TSVRFOiBcImFwMS5kYXRhZG9naHEuY29tXCJcbiAgICAgIC8vIH0sXG4gICAgICB0cmFjaW5nOiBsYW1iZGEuVHJhY2luZy5BQ1RJVkUsXG4gICAgfSk7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gU3RlcCBGdW5jdGlvbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gY29uc3Qgc3RlcEZ1bmN0aW9uc1JvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgcGFyYW0uc3RlcEZ1bmN0aW9ucy5yb2xlTmFtZSwge1xuICAgIC8vICAgcm9sZU5hbWU6IHBhcmFtLnN0ZXBGdW5jdGlvbnMucm9sZU5hbWUsXG4gICAgLy8gICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcInN0YXRlcy5hbWF6b25hd3MuY29tXCIpLFxuICAgIC8vICAgbWFuYWdlZFBvbGljaWVzOiBbaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQVdTTGFtYmRhX0Z1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkNsb3VkV2F0Y2hGdWxsQWNjZXNzVjJcIildLFxuICAgIC8vIH0pO1xuICAgIC8vIGNvbnN0IHN0ZXBGdW5jdGlvbnNMb2dHcm91cCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsIHBhcmFtLnN0ZXBGdW5jdGlvbnMubG9nR3JvdXBOYW1lLCB7XG4gICAgLy8gICBsb2dHcm91cE5hbWU6IHBhcmFtLnN0ZXBGdW5jdGlvbnMubG9nR3JvdXBOYW1lLFxuICAgIC8vICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAvLyAgIGxvZ0dyb3VwQ2xhc3M6IGxvZ3MuTG9nR3JvdXBDbGFzcy5TVEFOREFSRCxcbiAgICAvLyAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgLy8gfSk7XG4gICAgLy8gY29uc3QgZmlyc3RUYXNrTGFtYmRhID0gbmV3IHNmbnRhc2suTGFtYmRhSW52b2tlKHRoaXMsIFwiZmlyc3RUYXNrXCIsIHtcbiAgICAvLyAgIGxhbWJkYUZ1bmN0aW9uOiBsYW1iZGFDaGF0LFxuICAgIC8vIH0pO1xuICAgIC8vIGNvbnN0IHN1Y2Nlc3MgPSBuZXcgc2ZuLlN1Y2NlZWQodGhpcywgXCJTdWNjZXNzVGFza1wiKTtcbiAgICAvLyBjb25zdCBkZWZpbml0aW9uID0gZmlyc3RUYXNrTGFtYmRhLm5leHQoc3VjY2Vzcyk7XG4gICAgLy8gY29uc3Qgc3RlcEZ1bmN0aW9ucyA9IG5ldyBzZm4uU3RhdGVNYWNoaW5lKHRoaXMsIHBhcmFtLnN0ZXBGdW5jdGlvbnMuc3RhdGVNYWNoaW5lTmFtZSwge1xuICAgIC8vICAgc3RhdGVNYWNoaW5lTmFtZTogcGFyYW0uc3RlcEZ1bmN0aW9ucy5zdGF0ZU1hY2hpbmVOYW1lLFxuICAgIC8vICAgdHJhY2luZ0VuYWJsZWQ6IHRydWUsXG4gICAgLy8gICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDUpLFxuICAgIC8vICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAvLyAgIGxvZ3M6IHtcbiAgICAvLyAgICAgbGV2ZWw6IHNmbi5Mb2dMZXZlbC5BTEwsXG4gICAgLy8gICAgIGRlc3RpbmF0aW9uOiBzdGVwRnVuY3Rpb25zTG9nR3JvdXAsXG4gICAgLy8gICB9LFxuICAgIC8vICAgcm9sZTogc3RlcEZ1bmN0aW9uc1JvbGUsXG4gICAgLy8gICBzdGF0ZU1hY2hpbmVUeXBlOiBzZm4uU3RhdGVNYWNoaW5lVHlwZS5FWFBSRVNTLFxuICAgIC8vICAgZGVmaW5pdGlvbkJvZHk6IHNmbi5EZWZpbml0aW9uQm9keS5mcm9tQ2hhaW5hYmxlKGRlZmluaXRpb24pLFxuICAgIC8vIH0pO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gQVBJIEdhdGV3YXkgV2Vic29ja2V0ICAgICAgICAgICAgICAgICAgICAgIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gY29uc3QgYXBpZ2F0ZXdheVNmblJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgcGFyYW0ud2Vic29ja2V0LnJvbGVOYW1lLCB7XG4gICAgLy8gICByb2xlTmFtZTogcGFyYW0ud2Vic29ja2V0LnJvbGVOYW1lLFxuICAgIC8vICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoXCJhcGlnYXRld2F5LmFtYXpvbmF3cy5jb21cIiksXG4gICAgLy8gICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NTdGVwRnVuY3Rpb25zRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQ2xvdWRXYXRjaEZ1bGxBY2Nlc3NWMlwiKV0sXG4gICAgLy8gfSk7XG4gICAgY29uc3Qgd2ViU29ja2V0QXBpID0gbmV3IGFwaWd3djIuV2ViU29ja2V0QXBpKHRoaXMsIHBhcmFtLndlYnNvY2tldC5hcGlOYW1lLCB7XG4gICAgICBhcGlOYW1lOiBwYXJhbS53ZWJzb2NrZXQuYXBpTmFtZSxcbiAgICAgIC8vIOOCs+ODs+OCveODvOODq+OBi+OCieWPjOaWueWQkemAmuS/oeOCkuacieWKueWMluOBmeOCi+OBk+OBqOOCkuW/mOOCjOOBmuOBq1xuICAgICAgLy8gZGVmYXVsdFJvdXRlT3B0aW9uczoge1xuICAgICAgLy8gICBpbnRlZ3JhdGlvbjogbmV3IFdlYlNvY2tldEF3c0ludGVncmF0aW9uKFwiU3RlcEZ1bmN0aW9uc1wiLCB7XG4gICAgICAvLyAgICAgaW50ZWdyYXRpb25Vcmk6IGBhcm46YXdzOmFwaWdhdGV3YXk6JHt0aGlzLnJlZ2lvbn06c3RhdGVzOmFjdGlvbi9TdGFydFN5bmNFeGVjdXRpb25gLFxuICAgICAgLy8gICAgIGludGVncmF0aW9uTWV0aG9kOiBhcGlnd3YyLkh0dHBNZXRob2QuUE9TVCxcbiAgICAgIC8vICAgICBjcmVkZW50aWFsc1JvbGU6IGFwaWdhdGV3YXlTZm5Sb2xlLFxuICAgICAgLy8gICAgIHBhc3N0aHJvdWdoQmVoYXZpb3I6IGFwaWd3djIuUGFzc3Rocm91Z2hCZWhhdmlvci5XSEVOX05PX1RFTVBMQVRFUyxcbiAgICAgIC8vICAgfSksXG4gICAgICAvLyB9LFxuICAgICAgZGVmYXVsdFJvdXRlT3B0aW9uczoge1xuICAgICAgICBpbnRlZ3JhdGlvbjogbmV3IFdlYlNvY2tldExhbWJkYUludGVncmF0aW9uKFwiY29ubmVjdFwiLCBsYW1iZGFDaGF0KSxcbiAgICAgIH0sXG4gICAgICBjb25uZWN0Um91dGVPcHRpb25zOiB7XG4gICAgICAgIGludGVncmF0aW9uOiBuZXcgV2ViU29ja2V0TGFtYmRhSW50ZWdyYXRpb24oXCJjb25uZWN0XCIsIGxhbWJkYUNoYXQpLFxuICAgICAgfSxcbiAgICAgIGRpc2Nvbm5lY3RSb3V0ZU9wdGlvbnM6IHtcbiAgICAgICAgaW50ZWdyYXRpb246IG5ldyBXZWJTb2NrZXRMYW1iZGFJbnRlZ3JhdGlvbihcImRpc2Nvbm5lY3RcIiwgbGFtYmRhQ2hhdCksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IHdlYlNvY2tldEFwaVN0YWdlID0gbmV3IGFwaWd3djIuV2ViU29ja2V0U3RhZ2UodGhpcywgcGFyYW0ud2Vic29ja2V0LnN0YWdlTmFtZSwge1xuICAgICAgd2ViU29ja2V0QXBpLFxuICAgICAgc3RhZ2VOYW1lOiBwYXJhbS53ZWJzb2NrZXQuc3RhZ2VOYW1lLFxuICAgICAgYXV0b0RlcGxveTogdHJ1ZSxcbiAgICB9KTtcbiAgICBjb25zdCBkZWZhdWx0RG9tYWluID0gYCR7d2ViU29ja2V0QXBpLmFwaUlkfS5leGVjdXRlLWFwaS4ke3RoaXMucmVnaW9ufS5hbWF6b25hd3MuY29tYDtcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBcIndlYnNvY2tldERvbWFpbk5hbWVcIiwge1xuICAgICAgZXhwb3J0TmFtZTogXCJ3ZWJzb2NrZXREb21haW5OYW1lXCIsXG4gICAgICB2YWx1ZTogZGVmYXVsdERvbWFpbixcbiAgICB9KTtcbiAgfVxufVxuIl19