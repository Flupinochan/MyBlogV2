import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

import * as path from "path";
import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";

import { MyBlogParam2V2 } from "./parameters2";

const param = new MyBlogParam2V2();

export class Myblogv2Stack2 extends cdk.Stack {
  public readonly api: apigw.LambdaRestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
      timeout: Duration.minutes(15),
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
    apiChat.addMethod(
      "POST",
      new apigw.LambdaIntegration(lambdaChat, {
        proxy: true,
      }),
      {
        methodResponses: [
          {
            statusCode: "200",
            responseModels: {
              "application/json": apigw.Model.EMPTY_MODEL,
            },
          },
        ],
      },
    );
  }
}
