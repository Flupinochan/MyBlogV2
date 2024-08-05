import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration, WebSocketAwsIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as sfntask from "aws-cdk-lib/aws-stepfunctions-tasks";

import * as path from "path";
import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";

import { MyBlogParam4V2 } from "./parameters4";

const param = new MyBlogParam4V2();

export class Myblogv2Stack4 extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
      timeout: Duration.minutes(15),
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
        integration: new WebSocketLambdaIntegration("connect", lambdaChat),
      },
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration("connect", lambdaChat),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration("disconnect", lambdaChat),
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
