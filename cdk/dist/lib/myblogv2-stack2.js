"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Myblogv2Stack2 = void 0;
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const logs = require("aws-cdk-lib/aws-logs");
const apigw = require("aws-cdk-lib/aws-apigateway");
const lambda = require("aws-cdk-lib/aws-lambda");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
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
        ////////////////////
        /// Chat History ///
        ////////////////////
        const lambdaLogGroupChatDB = new logs.LogGroup(this, param.lambda.logGroupName2, {
            logGroupName: param.lambda.logGroupName2,
            retention: logs.RetentionDays.ONE_DAY,
            logGroupClass: logs.LogGroupClass.STANDARD,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        const lambdaChatDB = new lambda.Function(this, param.lambda.functionName2, {
            functionName: param.lambda.functionName2,
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: "index.lambda_handler",
            role: lambdaRole,
            code: lambda.Code.fromAsset(path.join(__dirname, "../../lambda_code/history")),
            timeout: aws_cdk_lib_1.Duration.minutes(15),
            logGroup: lambdaLogGroupChatDB,
            layers: [lambdaLayer],
            environment: {
                DYNAMODB_TABLE: param.dynamodb.tableName,
                PRIMARY_KEY: param.dynamodb.primaryKeyName,
            },
            tracing: lambda.Tracing.ACTIVE,
        });
        ///////////
        /// SES ///
        ///////////
        const lambdaLogGroupSES = new logs.LogGroup(this, param.lambda.logGroupName3, {
            logGroupName: param.lambda.logGroupName3,
            retention: logs.RetentionDays.ONE_DAY,
            logGroupClass: logs.LogGroupClass.STANDARD,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        const lambdaSES = new lambda.Function(this, param.lambda.functionName3, {
            functionName: param.lambda.functionName3,
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: "index.lambda_handler",
            role: lambdaRole,
            code: lambda.Code.fromAsset(path.join(__dirname, "../../lambda_code/ses")),
            timeout: aws_cdk_lib_1.Duration.minutes(15),
            logGroup: lambdaLogGroupSES,
            layers: [lambdaLayer],
            environment: {
                SES: "SES",
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
        ////////////
        /// Chat ///
        ////////////
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
        ///////////
        /// SES ///
        ///////////
        const apiSES = apigwLambda.root.addResource("ses");
        apiSES.addMethod("POST", new apigw.LambdaIntegration(lambdaSES, {
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
        ////////////////////
        /// Chat History ///
        ////////////////////
        ///////////
        /// GET ///
        ///////////
        const apiGetHistory = apigwLambda.root.addResource("gethistory");
        apiGetHistory.addMethod("GET", new apigw.LambdaIntegration(lambdaChatDB, {
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
        ////////////
        /// POST ///
        ////////////
        const apiPostHistory = apigwLambda.root.addResource("posthistory");
        apiPostHistory.addMethod("POST", new apigw.LambdaIntegration(lambdaChatDB, {
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
        //////////////
        /// DELETE ///
        //////////////
        const apiDeleteHistory = apigwLambda.root.addResource("deletehistory");
        apiDeleteHistory.addMethod("DELETE", new apigw.LambdaIntegration(lambdaChatDB, {
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
        ////////////////
        /// DynamoDB ///
        ////////////////
        const dynamoTable = new dynamodb.TableV2(this, param.dynamodb.tableName, {
            tableName: param.dynamodb.tableName,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {
                name: param.dynamodb.primaryKeyName,
                type: dynamodb.AttributeType.STRING,
            },
        });
    }
}
exports.Myblogv2Stack2 = Myblogv2Stack2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2syLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9teWJsb2d2Mi1zdGFjazIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQyw2Q0FBNkM7QUFDN0Msb0RBQW9EO0FBQ3BELGlEQUFpRDtBQUNqRCxxREFBcUQ7QUFFckQsNkJBQTZCO0FBRTdCLDZDQUF1QztBQUV2QywrQ0FBK0M7QUFFL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSw0QkFBYyxFQUFFLENBQUM7QUFFbkMsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QixrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxZQUFZO1FBQ1osWUFBWTtRQUNaLFlBQVk7UUFDWixNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQzNELFFBQVEsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFDL0IsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDO1lBQzNELGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMseUJBQXlCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLHdCQUF3QixDQUFDLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsMEJBQTBCLENBQUMsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFD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Z0IsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN2RSxnQkFBZ0IsQ0FBQyxTQUFTLENBQ3hCLFFBQVEsRUFDUixJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUU7WUFDeEMsS0FBSyxFQUFFLElBQUk7U0FDWixDQUFDLEVBQ0Y7WUFDRSxlQUFlLEVBQUU7Z0JBQ2Y7b0JBQ0UsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLGNBQWMsRUFBRTt3QkFDZCxrQkFBa0IsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVc7cUJBQzVDO2lCQUNGO2FBQ0Y7U0FDRixDQUNGLENBQUM7UUFDRixnQkFBZ0I7UUFDaEIsZ0JBQWdCO1FBQ2hCLGdCQUFnQjtRQUNoQixNQUFNLFdBQVcsR0FBRyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFO1lBQ3ZFLFNBQVMsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVM7WUFDbkMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTztZQUN4QyxZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsY0FBYztnQkFDbkMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTTthQUNwQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQW5SRCx3Q0FtUkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sb2dzXCI7XG5pbXBvcnQgKiBhcyBhcGlndyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXlcIjtcbmltcG9ydCAqIGFzIGxhbWJkYSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxhbWJkYVwiO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSBcImF3cy1jZGstbGliL2F3cy1keW5hbW9kYlwiO1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcblxuaW1wb3J0IHsgTXlCbG9nUGFyYW0yVjIgfSBmcm9tIFwiLi9wYXJhbWV0ZXJzMlwiO1xuXG5jb25zdCBwYXJhbSA9IG5ldyBNeUJsb2dQYXJhbTJWMigpO1xuXG5leHBvcnQgY2xhc3MgTXlibG9ndjJTdGFjazIgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gTGFtYmRhICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy8vXG4gICAgLy8vIENoYXQgLy8vXG4gICAgLy8vLy8vLy8vLy8vXG4gICAgY29uc3QgbGFtYmRhUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBwYXJhbS5sYW1iZGEucm9sZU5hbWUsIHtcbiAgICAgIHJvbGVOYW1lOiBwYXJhbS5sYW1iZGEucm9sZU5hbWUsXG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImxhbWJkYS5hbWF6b25hd3MuY29tXCIpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uQmVkcm9ja0Z1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkNsb3VkV2F0Y2hGdWxsQWNjZXNzVjJcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblMzRnVsbEFjY2Vzc1wiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uRHluYW1vREJGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25BUElHYXRld2F5QWRtaW5pc3RyYXRvclwiKSwgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKFwiQW1hem9uQVBJR2F0ZXdheUludm9rZUZ1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFtYXpvblNFU0Z1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIlNlY3JldHNNYW5hZ2VyUmVhZFdyaXRlXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBbWF6b25TRVNGdWxsQWNjZXNzXCIpXSxcbiAgICAgIGlubGluZVBvbGljaWVzOiB7XG4gICAgICAgIGlubGluZVBvbGljeTogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcInRyYW5zY3JpYmU6KlwiXSxcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbXCIqXCJdLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgXSxcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGxhbWJkYUxvZ0dyb3VwQ2hhdCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsIHBhcmFtLmxhbWJkYS5sb2dHcm91cE5hbWUsIHtcbiAgICAgIGxvZ0dyb3VwTmFtZTogcGFyYW0ubGFtYmRhLmxvZ0dyb3VwTmFtZSxcbiAgICAgIHJldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9EQVksXG4gICAgICBsb2dHcm91cENsYXNzOiBsb2dzLkxvZ0dyb3VwQ2xhc3MuU1RBTkRBUkQsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhbWJkYUxheWVyID0gbmV3IGxhbWJkYS5MYXllclZlcnNpb24odGhpcywgcGFyYW0ubGFtYmRhLmxheWVyTmFtZSwge1xuICAgICAgbGF5ZXJWZXJzaW9uTmFtZTogcGFyYW0ubGFtYmRhLmxheWVyTmFtZSxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uLy4uL2xhbWJkYV9jb2RlL2xheWVyL1wiKSksXG4gICAgICBjb21wYXRpYmxlUnVudGltZXM6IFtsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMl0sXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhbWJkYUNoYXQgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsIHBhcmFtLmxhbWJkYS5mdW5jdGlvbk5hbWUsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogcGFyYW0ubGFtYmRhLmZ1bmN0aW9uTmFtZSxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzEyLFxuICAgICAgaGFuZGxlcjogXCJpbmRleC5sYW1iZGFfaGFuZGxlclwiLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uLy4uL2xhbWJkYV9jb2RlL2NoYXQvXCIpKSxcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLm1pbnV0ZXMoMTUpLFxuICAgICAgbG9nR3JvdXA6IGxhbWJkYUxvZ0dyb3VwQ2hhdCxcbiAgICAgIGxheWVyczogW2xhbWJkYUxheWVyXSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIEJVQ0tFVF9OQU1FOiBcInRlc3RcIixcbiAgICAgIH0sXG4gICAgICB0cmFjaW5nOiBsYW1iZGEuVHJhY2luZy5BQ1RJVkUsXG4gICAgfSk7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gQ2hhdCBIaXN0b3J5IC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgY29uc3QgbGFtYmRhTG9nR3JvdXBDaGF0REIgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCBwYXJhbS5sYW1iZGEubG9nR3JvdXBOYW1lMiwge1xuICAgICAgbG9nR3JvdXBOYW1lOiBwYXJhbS5sYW1iZGEubG9nR3JvdXBOYW1lMixcbiAgICAgIHJldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9EQVksXG4gICAgICBsb2dHcm91cENsYXNzOiBsb2dzLkxvZ0dyb3VwQ2xhc3MuU1RBTkRBUkQsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuICAgIGNvbnN0IGxhbWJkYUNoYXREQiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgcGFyYW0ubGFtYmRhLmZ1bmN0aW9uTmFtZTIsIHtcbiAgICAgIGZ1bmN0aW9uTmFtZTogcGFyYW0ubGFtYmRhLmZ1bmN0aW9uTmFtZTIsXG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMixcbiAgICAgIGhhbmRsZXI6IFwiaW5kZXgubGFtYmRhX2hhbmRsZXJcIixcbiAgICAgIHJvbGU6IGxhbWJkYVJvbGUsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLi8uLi9sYW1iZGFfY29kZS9oaXN0b3J5XCIpKSxcbiAgICAgIHRpbWVvdXQ6IER1cmF0aW9uLm1pbnV0ZXMoMTUpLFxuICAgICAgbG9nR3JvdXA6IGxhbWJkYUxvZ0dyb3VwQ2hhdERCLFxuICAgICAgbGF5ZXJzOiBbbGFtYmRhTGF5ZXJdLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgRFlOQU1PREJfVEFCTEU6IHBhcmFtLmR5bmFtb2RiLnRhYmxlTmFtZSxcbiAgICAgICAgUFJJTUFSWV9LRVk6IHBhcmFtLmR5bmFtb2RiLnByaW1hcnlLZXlOYW1lLFxuICAgICAgfSxcbiAgICAgIHRyYWNpbmc6IGxhbWJkYS5UcmFjaW5nLkFDVElWRSxcbiAgICB9KTtcbiAgICAvLy8vLy8vLy8vL1xuICAgIC8vLyBTRVMgLy8vXG4gICAgLy8vLy8vLy8vLy9cbiAgICBjb25zdCBsYW1iZGFMb2dHcm91cFNFUyA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsIHBhcmFtLmxhbWJkYS5sb2dHcm91cE5hbWUzLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IHBhcmFtLmxhbWJkYS5sb2dHcm91cE5hbWUzLFxuICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAgIGxvZ0dyb3VwQ2xhc3M6IGxvZ3MuTG9nR3JvdXBDbGFzcy5TVEFOREFSRCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG4gICAgY29uc3QgbGFtYmRhU0VTID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBwYXJhbS5sYW1iZGEuZnVuY3Rpb25OYW1lMywge1xuICAgICAgZnVuY3Rpb25OYW1lOiBwYXJhbS5sYW1iZGEuZnVuY3Rpb25OYW1lMyxcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzEyLFxuICAgICAgaGFuZGxlcjogXCJpbmRleC5sYW1iZGFfaGFuZGxlclwiLFxuICAgICAgcm9sZTogbGFtYmRhUm9sZSxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCBcIi4uLy4uL2xhbWJkYV9jb2RlL3Nlc1wiKSksXG4gICAgICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDE1KSxcbiAgICAgIGxvZ0dyb3VwOiBsYW1iZGFMb2dHcm91cFNFUyxcbiAgICAgIGxheWVyczogW2xhbWJkYUxheWVyXSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFNFUzogXCJTRVNcIixcbiAgICAgIH0sXG4gICAgICB0cmFjaW5nOiBsYW1iZGEuVHJhY2luZy5BQ1RJVkUsXG4gICAgfSk7XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBBUEkgR2F0ZXdheSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICBjb25zdCBhcGlnd0xvZ3MgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCBwYXJhbS5hcGlHYXRld2F5LmxvZ0dyb3VwTmFtZSwge1xuICAgICAgbG9nR3JvdXBOYW1lOiBwYXJhbS5hcGlHYXRld2F5LmxvZ0dyb3VwTmFtZSxcbiAgICAgIHJldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9EQVksXG4gICAgICBsb2dHcm91cENsYXNzOiBsb2dzLkxvZ0dyb3VwQ2xhc3MuU1RBTkRBUkQsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuICAgIGNvbnN0IGFwaWd3TGFtYmRhID0gbmV3IGFwaWd3LkxhbWJkYVJlc3RBcGkodGhpcywgcGFyYW0uYXBpR2F0ZXdheS5hcGlOYW1lLCB7XG4gICAgICByZXN0QXBpTmFtZTogcGFyYW0uYXBpR2F0ZXdheS5hcGlOYW1lLFxuICAgICAgaGFuZGxlcjogbGFtYmRhQ2hhdCxcbiAgICAgIHByb3h5OiBmYWxzZSxcbiAgICAgIGNsb3VkV2F0Y2hSb2xlOiB0cnVlLFxuICAgICAgY2xvdWRXYXRjaFJvbGVSZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgZW5kcG9pbnRUeXBlczogW2FwaWd3LkVuZHBvaW50VHlwZS5SRUdJT05BTF0sXG4gICAgICBkZXBsb3lPcHRpb25zOiB7XG4gICAgICAgIHN0YWdlTmFtZTogXCJhcGlcIixcbiAgICAgICAgbG9nZ2luZ0xldmVsOiBhcGlndy5NZXRob2RMb2dnaW5nTGV2ZWwuSU5GTyxcbiAgICAgICAgbWV0cmljc0VuYWJsZWQ6IHRydWUsXG4gICAgICAgIGFjY2Vzc0xvZ0Rlc3RpbmF0aW9uOiBuZXcgYXBpZ3cuTG9nR3JvdXBMb2dEZXN0aW5hdGlvbihhcGlnd0xvZ3MpLFxuICAgICAgICBhY2Nlc3NMb2dGb3JtYXQ6IGFwaWd3LkFjY2Vzc0xvZ0Zvcm1hdC5jbGYoKSxcbiAgICAgICAgdHJhY2luZ0VuYWJsZWQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgcG9saWN5OiBpYW0uUG9saWN5RG9jdW1lbnQuZnJvbUpzb24oe1xuICAgICAgICBWZXJzaW9uOiBcIjIwMTItMTAtMTdcIixcbiAgICAgICAgU3RhdGVtZW50OiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgRWZmZWN0OiBcIkRlbnlcIixcbiAgICAgICAgICAgIFByaW5jaXBhbDogXCIqXCIsXG4gICAgICAgICAgICBBY3Rpb246IFwiZXhlY3V0ZS1hcGk6SW52b2tlXCIsXG4gICAgICAgICAgICBSZXNvdXJjZTogXCIqXCIsXG4gICAgICAgICAgICBDb25kaXRpb246IHtcbiAgICAgICAgICAgICAgU3RyaW5nTm90RXF1YWxzOiB7XG4gICAgICAgICAgICAgICAgXCJhd3M6UmVmZXJlclwiOiBcInZhbGlkYXRlLWNmblwiLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIEVmZmVjdDogXCJBbGxvd1wiLFxuICAgICAgICAgICAgUHJpbmNpcGFsOiBcIipcIixcbiAgICAgICAgICAgIEFjdGlvbjogXCJleGVjdXRlLWFwaTpJbnZva2VcIixcbiAgICAgICAgICAgIFJlc291cmNlOiBcIipcIixcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSksXG4gICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IHtcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBhcGlndy5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWd3LkNvcnMuQUxMX01FVEhPRFMsXG4gICAgICAgIGFsbG93SGVhZGVyczogYXBpZ3cuQ29ycy5ERUZBVUxUX0hFQURFUlMsXG4gICAgICAgIGFsbG93Q3JlZGVudGlhbHM6IHRydWUsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGRlZmF1bHREb21haW4gPSBgJHthcGlnd0xhbWJkYS5yZXN0QXBpSWR9LmV4ZWN1dGUtYXBpLiR7dGhpcy5yZWdpb259LmFtYXpvbmF3cy5jb21gO1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIFwiYXBpZ3dEb21haW5OYW1lXCIsIHtcbiAgICAgIGV4cG9ydE5hbWU6IFwiYXBpZ3dEb21haW5OYW1lXCIsXG4gICAgICB2YWx1ZTogZGVmYXVsdERvbWFpbixcbiAgICB9KTtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vIEFQSSBNZXRob2QgQ2hhdCAodXNlUHJveHkpIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8vLy8vLy8vLy9cbiAgICAvLy8gQ2hhdCAvLy9cbiAgICAvLy8vLy8vLy8vLy9cbiAgICBjb25zdCBhcGlDaGF0ID0gYXBpZ3dMYW1iZGEucm9vdC5hZGRSZXNvdXJjZShcImNoYXRcIik7XG4gICAgYXBpQ2hhdC5hZGRNZXRob2QoXG4gICAgICBcIlBPU1RcIixcbiAgICAgIG5ldyBhcGlndy5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFDaGF0LCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZU1vZGVsczoge1xuICAgICAgICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjogYXBpZ3cuTW9kZWwuRU1QVFlfTU9ERUwsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICk7XG4gICAgLy8vLy8vLy8vLy9cbiAgICAvLy8gU0VTIC8vL1xuICAgIC8vLy8vLy8vLy8vXG4gICAgY29uc3QgYXBpU0VTID0gYXBpZ3dMYW1iZGEucm9vdC5hZGRSZXNvdXJjZShcInNlc1wiKTtcbiAgICBhcGlTRVMuYWRkTWV0aG9kKFxuICAgICAgXCJQT1NUXCIsXG4gICAgICBuZXcgYXBpZ3cuTGFtYmRhSW50ZWdyYXRpb24obGFtYmRhU0VTLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIG1ldGhvZFJlc3BvbnNlczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IFwiMjAwXCIsXG4gICAgICAgICAgICByZXNwb25zZU1vZGVsczoge1xuICAgICAgICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjogYXBpZ3cuTW9kZWwuRU1QVFlfTU9ERUwsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICk7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gQ2hhdCBIaXN0b3J5IC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vLy8vLy8vLy9cbiAgICAvLy8gR0VUIC8vL1xuICAgIC8vLy8vLy8vLy8vXG4gICAgY29uc3QgYXBpR2V0SGlzdG9yeSA9IGFwaWd3TGFtYmRhLnJvb3QuYWRkUmVzb3VyY2UoXCJnZXRoaXN0b3J5XCIpO1xuICAgIGFwaUdldEhpc3RvcnkuYWRkTWV0aG9kKFxuICAgICAgXCJHRVRcIixcbiAgICAgIG5ldyBhcGlndy5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFDaGF0REIsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlTW9kZWxzOiB7XG4gICAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiBhcGlndy5Nb2RlbC5FTVBUWV9NT0RFTCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgKTtcbiAgICAvLy8vLy8vLy8vLy9cbiAgICAvLy8gUE9TVCAvLy9cbiAgICAvLy8vLy8vLy8vLy9cbiAgICBjb25zdCBhcGlQb3N0SGlzdG9yeSA9IGFwaWd3TGFtYmRhLnJvb3QuYWRkUmVzb3VyY2UoXCJwb3N0aGlzdG9yeVwiKTtcbiAgICBhcGlQb3N0SGlzdG9yeS5hZGRNZXRob2QoXG4gICAgICBcIlBPU1RcIixcbiAgICAgIG5ldyBhcGlndy5MYW1iZGFJbnRlZ3JhdGlvbihsYW1iZGFDaGF0REIsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgbWV0aG9kUmVzcG9uc2VzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3RhdHVzQ29kZTogXCIyMDBcIixcbiAgICAgICAgICAgIHJlc3BvbnNlTW9kZWxzOiB7XG4gICAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiBhcGlndy5Nb2RlbC5FTVBUWV9NT0RFTCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgKTtcbiAgICAvLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBERUxFVEUgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy9cbiAgICBjb25zdCBhcGlEZWxldGVIaXN0b3J5ID0gYXBpZ3dMYW1iZGEucm9vdC5hZGRSZXNvdXJjZShcImRlbGV0ZWhpc3RvcnlcIik7XG4gICAgYXBpRGVsZXRlSGlzdG9yeS5hZGRNZXRob2QoXG4gICAgICBcIkRFTEVURVwiLFxuICAgICAgbmV3IGFwaWd3LkxhbWJkYUludGVncmF0aW9uKGxhbWJkYUNoYXREQiwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiBcIjIwMFwiLFxuICAgICAgICAgICAgcmVzcG9uc2VNb2RlbHM6IHtcbiAgICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IGFwaWd3Lk1vZGVsLkVNUFRZX01PREVMLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICApO1xuICAgIC8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gRHluYW1vREIgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vL1xuICAgIGNvbnN0IGR5bmFtb1RhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlVjIodGhpcywgcGFyYW0uZHluYW1vZGIudGFibGVOYW1lLCB7XG4gICAgICB0YWJsZU5hbWU6IHBhcmFtLmR5bmFtb2RiLnRhYmxlTmFtZSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgICAgbmFtZTogcGFyYW0uZHluYW1vZGIucHJpbWFyeUtleU5hbWUsXG4gICAgICAgIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuIl19