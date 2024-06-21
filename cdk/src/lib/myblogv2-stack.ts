import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as certmgr from "aws-cdk-lib/aws-certificatemanager";
import * as iam from "aws-cdk-lib/aws-iam";
import * as pipeline from "aws-cdk-lib/aws-codepipeline";
import * as pipelineactions from "aws-cdk-lib/aws-codepipeline-actions";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";

import { MyBlogParamV2 } from "./parameters";

const param = new MyBlogParamV2();

export class Myblogv2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //////////////////////////////////////////////////
    /// S3, CloudFront                             ///
    //////////////////////////////////////////////////
    const s3Bucket = new s3.Bucket(this, param.s3.bucketName, {
      bucketName: param.s3.bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      bucketKeyEnabled: false,
    });
    // 証明書は、RSA 2048にすること
    // リージョンは、us-east-1
    const certificateArn = param.cloudfront.certificateArn;
    const certificate = certmgr.Certificate.fromCertificateArn(this, "MyBlogV2Certificate", certificateArn);
    const distribution = new cloudfront.Distribution(this, "cloudfront", {
      defaultBehavior: {
        origin: new origins.S3Origin(s3Bucket),
        compress: true,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      certificate: certificate,
      defaultRootObject: "index.html",
      domainNames: ["dev.metalmental.net"],
      errorResponses: [
        {
          httpStatus: 403,
          ttl: Duration.seconds(5),
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 404,
          ttl: Duration.seconds(5),
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
    });
    const oac = new cloudfront.CfnOriginAccessControl(this, param.cloudfront.oacName, {
      originAccessControlConfig: {
        name: param.cloudfront.oacName,
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
    });
    const cfnDistribution = distribution.node.defaultChild as cloudfront.CfnDistribution;
    cfnDistribution.addPropertyOverride("DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity", "");
    cfnDistribution.addPropertyOverride("DistributionConfig.Origins.0.OriginAccessControlId", oac.attrId);
    const s3BucketPolicy = new iam.PolicyStatement({
      actions: ["s3:GetObject"],
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
      resources: [`${s3Bucket.bucketArn}/*`],
    });
    s3BucketPolicy.addCondition("StringEquals", {
      "AWS:SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
    });
    s3Bucket.addToResourcePolicy(s3BucketPolicy);

    //////////////////////////////////////////////////
    /// GitHub - CodePipeline                      ///
    //////////////////////////////////////////////////
    const s3Artifact = new s3.Bucket(this, param.pipeline.s3Name, {
      bucketName: param.pipeline.s3Name,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      bucketKeyEnabled: false,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(1),
        },
      ],
    });
    const buildOutput = new pipeline.Artifact();
    const sourceAction = new pipelineactions.CodeStarConnectionsSourceAction({
      actionName: "GitHub",
      owner: "Flupinochan",
      repo: "MyBlogV2",
      branch: "master",
      output: buildOutput,
      connectionArn: param.pipeline.codestarConnectionArn,
    });
    const codebuildLogs = new logs.LogGroup(this, param.pipeline.codebuildLogsName, {
      logGroupName: param.pipeline.codebuildLogsName,
      retention: logs.RetentionDays.ONE_DAY,
      logGroupClass: logs.LogGroupClass.STANDARD,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const codebuildRole = new iam.Role(this, param.pipeline.codebuildRoleName, {
      roleName: param.pipeline.codebuildRoleName,
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AWSCodeBuildAdminAccess")],
      inlinePolicies: {
        inlinePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["s3:*"],
              resources: [`${s3Bucket.bucketArn}`, `${s3Bucket.bucketArn}/*`],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["cloudfront:*"],
              resources: [`arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`],
            }),
          ],
        }),
      },
    });
    const buildAction = new pipelineactions.CodeBuildAction({
      actionName: "Build",
      project: new codebuild.PipelineProject(this, param.pipeline.codebuildName, {
        projectName: param.pipeline.codebuildName,
        role: codebuildRole,
        environment: {
          computeType: codebuild.ComputeType.SMALL,
          buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
          privileged: true,
        },
        logging: {
          cloudWatch: {
            logGroup: codebuildLogs,
          },
        },
        buildSpec: codebuild.BuildSpec.fromObject({
          version: "0.2",
          phases: {
            build: {
              commands: ["echo s3 sync", "cd ./react/build/", `aws s3 sync . s3://${s3Bucket.bucketName} --delete`, "echo remove cloudfront cache", `aws cloudfront create-invalidation --distribution-id ${distribution.distributionId} --paths "/*"`],
            },
          },
        }),
      }),
      input: buildOutput,
    });
    const codePipeline = new pipeline.Pipeline(this, param.pipeline.pipelineName, {
      pipelineName: param.pipeline.pipelineName,
      executionMode: pipeline.ExecutionMode.QUEUED,
      pipelineType: pipeline.PipelineType.V2,
      artifactBucket: s3Artifact,
      stages: [
        {
          stageName: "Source",
          actions: [sourceAction],
        },
        {
          stageName: "Build",
          actions: [buildAction],
        },
      ],
    });
  }
}
