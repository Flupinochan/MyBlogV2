"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Myblogv2Stack2 = void 0;
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const logs = require("aws-cdk-lib/aws-logs");
const apigw = require("aws-cdk-lib/aws-apigateway");
const lambda = require("aws-cdk-lib/aws-lambda");
const path = require("path");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const parameters2_1 = require("./parameters2");
const param = new parameters2_1.MyBlogParam2V2();
class Myblogv2Stack2 extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //////////////////////////////////////////////////
        /// Lambda                                     ///
        //////////////////////////////////////////////////
        const lambdaRole = new iam.Role(this, param.lambda.roleName, {
            roleName: param.lambda.roleName,
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonBedrockFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccessV2"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonAPIGatewayAdministrator"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonAPIGatewayInvokeFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSESFullAccess")],
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
            code: lambda.Code.fromAsset(path.join(__dirname, "../../lambda_code/chat/")),
            timeout: aws_cdk_lib_1.Duration.minutes(15),
            logGroup: lambdaLogGroupChat,
            layers: [lambdaLayer],
            environment: {
                BUCKET_NAME: "test",
            },
            tracing: lambda.Tracing.ACTIVE,
        });
        //////////////////////////////////////////////////
        /// API Gateway                                ///
        //////////////////////////////////////////////////
        const apigwLogs = new logs.LogGroup(this, param.apiGateway.logGroupName, {
            logGroupName: param.apiGateway.logGroupName,
            retention: logs.RetentionDays.ONE_DAY,
            logGroupClass: logs.LogGroupClass.STANDARD,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        const apigwLambda = new apigw.LambdaRestApi(this, param.apiGateway.apiName, {
            restApiName: param.apiGateway.apiName,
            handler: lambdaChat,
            proxy: false,
            cloudWatchRole: true,
            cloudWatchRoleRemovalPolicy: cdk.RemovalPolicy.DESTROY,
            endpointTypes: [apigw.EndpointType.REGIONAL],
            deployOptions: {
                stageName: "api",
                loggingLevel: apigw.MethodLoggingLevel.INFO,
                metricsEnabled: true,
                accessLogDestination: new apigw.LogGroupLogDestination(apigwLogs),
                accessLogFormat: apigw.AccessLogFormat.clf(),
                tracingEnabled: true,
            },
            policy: iam.PolicyDocument.fromJson({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Deny",
                        Principal: "*",
                        Action: "execute-api:Invoke",
                        Resource: "*",
                        Condition: {
                            StringNotEquals: {
                                "aws:Referer": "validate-cfn",
                            },
                        },
                    },
                    {
                        Effect: "Allow",
                        Principal: "*",
                        Action: "execute-api:Invoke",
                        Resource: "*",
                    },
                ],
            }),
            defaultCorsPreflightOptions: {
                allowOrigins: apigw.Cors.ALL_ORIGINS,
                allowMethods: apigw.Cors.ALL_METHODS,
                allowHeaders: apigw.Cors.DEFAULT_HEADERS,
                allowCredentials: true,
            },
        });
        const defaultDomain = `${apigwLambda.restApiId}.execute-api.${this.region}.amazonaws.com`;
        new cdk.CfnOutput(this, "apigwDomainName", {
            exportName: "apigwDomainName",
            value: defaultDomain,
        });
        //////////////////////////////////
        /// API Method Chat (useProxy) ///
        //////////////////////////////////
        const apiChat = apigwLambda.root.addResource("chat");
        apiChat.addMethod("POST", new apigw.LambdaIntegration(lambdaChat, {
            proxy: true,
        }), {
            methodResponses: [
                {
                    statusCode: "200",
                    responseModels: {
                        "application/json": apigw.Model.EMPTY_MODEL,
                    },
                },
            ],
        });
    }
}
exports.Myblogv2Stack2 = Myblogv2Stack2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2syLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9teWJsb2d2Mi1zdGFjazIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBS25DLDJDQUEyQztBQUkzQyw2Q0FBNkM7QUFDN0Msb0RBQW9EO0FBQ3BELGlEQUFpRDtBQUVqRCw2QkFBNkI7QUFFN0IsNkNBQXVDO0FBRXZDLCtDQUErQztBQUUvQyxNQUFNLEtBQUssR0FBRyxJQUFJLDRCQUFjLEVBQUUsQ0FBQztBQUVuQyxNQUFhLGNBQWUsU0FBUSxHQUFHLENBQUMsS0FBSztJQUczQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLGtEQUFrRDtRQUNsRCxrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELE1BQU0sVUFBVSxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDM0QsUUFBUSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUTtZQUMvQixTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUM7WUFDM0QsZUFBZSxFQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsd0JBQXdCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLG9CQUFvQixDQUFDLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsK0JBQStCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFB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QVksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVc7Z0JBQ3BDLFlBQVksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWU7Z0JBQ3hDLGdCQUFnQixFQUFFLElBQUk7YUFDdkI7U0FDRixDQUFDLENBQUM7UUFDSCxNQUFNLGFBQWEsR0FBRyxHQUFHLFdBQVcsQ0FBQyxTQUFTLGdCQUFnQixJQUFJLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQztRQUMxRixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQ3pDLFVBQVUsRUFBRSxpQkFBaUI7WUFDN0IsS0FBSyxFQUFFLGFBQWE7U0FDckIsQ0FBQyxDQUFDO1FBQ0gsa0NBQWtDO1FBQ2xDLGtDQUFrQztRQUNsQyxrQ0FBa0M7UUFDbEMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckQsT0FBTyxDQUFDLFNBQVMsQ0FDZixNQUFNLEVBQ04sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsVUFBVSxFQUFFO1lBQ3RDLEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxFQUNGO1lBQ0UsZUFBZSxFQUFFO2dCQUNmO29CQUNFLFVBQVUsRUFBRSxLQUFLO29CQUNqQixjQUFjLEVBQUU7d0JBQ2Qsa0JBQWtCLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXO3FCQUM1QztpQkFDRjthQUNGO1NBQ0YsQ0FDRixDQUFDO0lBQ0osQ0FBQztDQUNGO0FBbElELHdDQWtJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCAqIGFzIHMzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jbG91ZGZyb250XCI7XG5pbXBvcnQgKiBhcyBvcmlnaW5zIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udC1vcmlnaW5zXCI7XG5pbXBvcnQgKiBhcyBjZXJ0bWdyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCAqIGFzIHBpcGVsaW5lIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY29kZXBpcGVsaW5lXCI7XG5pbXBvcnQgKiBhcyBwaXBlbGluZWFjdGlvbnMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jb2RlcGlwZWxpbmUtYWN0aW9uc1wiO1xuaW1wb3J0ICogYXMgY29kZWJ1aWxkIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY29kZWJ1aWxkXCI7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbG9nc1wiO1xuaW1wb3J0ICogYXMgYXBpZ3cgZnJvbSBcImF3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5XCI7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGFcIjtcblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5cbmltcG9ydCB7IE15QmxvZ1BhcmFtMlYyIH0gZnJvbSBcIi4vcGFyYW1ldGVyczJcIjtcblxuY29uc3QgcGFyYW0gPSBuZXcgTXlCbG9nUGFyYW0yVjIoKTtcblxuZXhwb3J0IGNsYXNzIE15YmxvZ3YyU3RhY2syIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IGFwaTogYXBpZ3cuTGFtYmRhUmVzdEFwaTtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gTGFtYmRhICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgY29uc3QgbGFtYmRhUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBwYXJhbS5sYW1iZGEucm9sZU5hbWUsIHtcbiAgICAgIHJvbGVOYW1lOiBwYXJhbS5sYW1iZGEucm9sZU5hbWUsXG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImxhbWJkYS5hbWF6b25hd3MuY29tXCIpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uQmVkcm9ja0Z1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkNsb3VkV2F0Y2hGdWxsQWNjZXNzVjJcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblMzRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uRHluYW1vREJGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25BUElHYXRld2F5QWRtaW5pc3RyYXRvclwiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uQVBJR2F0ZXdheUludm9rZUZ1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblNFU0Z1bGxBY2Nlc3NcIildLFxuICAgICAgaW5saW5lUG9saWNpZXM6IHtcbiAgICAgICAgaW5saW5lUG9saWN5OiBuZXcgaWFtLlBvbGljeURvY3VtZW50KHtcbiAgICAgICAgICBzdGF0ZW1lbnRzOiBbXG4gICAgICAgICAgICBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICAgICAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgICAgICAgICAgYWN0aW9uczogW1widHJhbnNjcmliZToqXCJdLFxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFtcIipcIl0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgbGFtYmRhTG9nR3JvdXBDaGF0ID0gbmV3IGxvZ3MuTG9nR3JvdXAodGhpcywgcGFyYW0ubGFtYmRhLmxvZ0dyb3VwTmFtZSwge1xuICAgICAgbG9nR3JvdXBOYW1lOiBwYXJhbS5sYW1iZGEubG9nR3JvdXBOYW1lLFxuICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAgIGxvZ0dyb3VwQ2xhc3M6IGxvZ3MuTG9nR3JvdXBDbGFzcy5TVEFOREFSRCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG4gICAgY29uc3QgbGFtYmRhTGF5ZXIgPSBuZXcgbGFtYmRhLkxheWVyVmVyc2lvbih0aGlzLCBwYXJhbS5sYW1iZGEubGF5ZXJOYW1lLCB7XG4gICAgICBsYXllclZlcnNpb25OYW1lOiBwYXJhbS5sYW1iZGEubGF5ZXJOYW1lLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vLi4vbGFtYmRhX2NvZGUvbGF5ZXIvXCIpKSxcbiAgICAgIGNvbXBhdGlibGVSdW50aW1lczogW2xhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzEyXSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG4gICAgY29uc3QgbGFtYmRhQ2hhdCA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgcGFyYW0ubGFtYmRhLmZ1bmN0aW9uTmFtZSwge1xuICAgICAgZnVuY3Rpb25OYW1lOiBwYXJhbS5sYW1iZGEuZnVuY3Rpb25OYW1lLFxuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTIsXG4gICAgICBoYW5kbGVyOiBcImluZGV4LmxhbWJkYV9oYW5kbGVyXCIsXG4gICAgICByb2xlOiBsYW1iZGFSb2xlLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsIFwiLi4vLi4vbGFtYmRhX2NvZGUvY2hhdC9cIikpLFxuICAgICAgdGltZW91dDogRHVyYXRpb24ubWludXRlcygxNSksXG4gICAgICBsb2dHcm91cDogbGFtYmRhTG9nR3JvdXBDaGF0LFxuICAgICAgbGF5ZXJzOiBbbGFtYmRhTGF5ZXJdLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgQlVDS0VUX05BTUU6IFwidGVzdFwiLFxuICAgICAgfSxcbiAgICAgIHRyYWNpbmc6IGxhbWJkYS5UcmFjaW5nLkFDVElWRSxcbiAgICB9KTtcblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vIEFQSSBHYXRld2F5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIGNvbnN0IGFwaWd3TG9ncyA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsIHBhcmFtLmFwaUdhdGV3YXkubG9nR3JvdXBOYW1lLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IHBhcmFtLmFwaUdhdGV3YXkubG9nR3JvdXBOYW1lLFxuICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAgIGxvZ0dyb3VwQ2xhc3M6IGxvZ3MuTG9nR3JvdXBDbGFzcy5TVEFOREFSRCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG4gICAgY29uc3QgYXBpZ3dMYW1iZGEgPSBuZXcgYXBpZ3cuTGFtYmRhUmVzdEFwaSh0aGlzLCBwYXJhbS5hcGlHYXRld2F5LmFwaU5hbWUsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiBwYXJhbS5hcGlHYXRld2F5LmFwaU5hbWUsXG4gICAgICBoYW5kbGVyOiBsYW1iZGFDaGF0LFxuICAgICAgcHJveHk6IGZhbHNlLFxuICAgICAgY2xvdWRXYXRjaFJvbGU6IHRydWUsXG4gICAgICBjbG91ZFdhdGNoUm9sZVJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBlbmRwb2ludFR5cGVzOiBbYXBpZ3cuRW5kcG9pbnRUeXBlLlJFR0lPTkFMXSxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiBcImFwaVwiLFxuICAgICAgICBsb2dnaW5nTGV2ZWw6IGFwaWd3Lk1ldGhvZExvZ2dpbmdMZXZlbC5JTkZPLFxuICAgICAgICBtZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgYWNjZXNzTG9nRGVzdGluYXRpb246IG5ldyBhcGlndy5Mb2dHcm91cExvZ0Rlc3RpbmF0aW9uKGFwaWd3TG9ncyksXG4gICAgICAgIGFjY2Vzc0xvZ0Zvcm1hdDogYXBpZ3cuQWNjZXNzTG9nRm9ybWF0LmNsZigpLFxuICAgICAgICB0cmFjaW5nRW5hYmxlZDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBwb2xpY3k6IGlhbS5Qb2xpY3lEb2N1bWVudC5mcm9tSnNvbih7XG4gICAgICAgIFZlcnNpb246IFwiMjAxMi0xMC0xN1wiLFxuICAgICAgICBTdGF0ZW1lbnQ6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBFZmZlY3Q6IFwiRGVueVwiLFxuICAgICAgICAgICAgUHJpbmNpcGFsOiBcIipcIixcbiAgICAgICAgICAgIEFjdGlvbjogXCJleGVjdXRlLWFwaTpJbnZva2VcIixcbiAgICAgICAgICAgIFJlc291cmNlOiBcIipcIixcbiAgICAgICAgICAgIENvbmRpdGlvbjoge1xuICAgICAgICAgICAgICBTdHJpbmdOb3RFcXVhbHM6IHtcbiAgICAgICAgICAgICAgICBcImF3czpSZWZlcmVyXCI6IFwidmFsaWRhdGUtY2ZuXCIsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgRWZmZWN0OiBcIkFsbG93XCIsXG4gICAgICAgICAgICBQcmluY2lwYWw6IFwiKlwiLFxuICAgICAgICAgICAgQWN0aW9uOiBcImV4ZWN1dGUtYXBpOkludm9rZVwiLFxuICAgICAgICAgICAgUmVzb3VyY2U6IFwiKlwiLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICAgIGRlZmF1bHRDb3JzUHJlZmxpZ2h0T3B0aW9uczoge1xuICAgICAgICBhbGxvd09yaWdpbnM6IGFwaWd3LkNvcnMuQUxMX09SSUdJTlMsXG4gICAgICAgIGFsbG93TWV0aG9kczogYXBpZ3cuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBhcGlndy5Db3JzLkRFRkFVTFRfSEVBREVSUyxcbiAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgZGVmYXVsdERvbWFpbiA9IGAke2FwaWd3TGFtYmRhLnJlc3RBcGlJZH0uZXhlY3V0ZS1hcGkuJHt0aGlzLnJlZ2lvbn0uYW1hem9uYXdzLmNvbWA7XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgXCJhcGlnd0RvbWFpbk5hbWVcIiwge1xuICAgICAgZXhwb3J0TmFtZTogXCJhcGlnd0RvbWFpbk5hbWVcIixcbiAgICAgIHZhbHVlOiBkZWZhdWx0RG9tYWluLFxuICAgIH0pO1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gQVBJIE1ldGhvZCBDaGF0ICh1c2VQcm94eSkgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIGNvbnN0IGFwaUNoYXQgPSBhcGlnd0xhbWJkYS5yb290LmFkZFJlc291cmNlKFwiY2hhdFwiKTtcbiAgICBhcGlDaGF0LmFkZE1ldGhvZChcbiAgICAgIFwiUE9TVFwiLFxuICAgICAgbmV3IGFwaWd3LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYUNoYXQsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlTW9kZWxzOiB7XG4gICAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiBhcGlndy5Nb2RlbC5FTVBUWV9NT0RFTCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgKTtcbiAgfVxufVxuIl19