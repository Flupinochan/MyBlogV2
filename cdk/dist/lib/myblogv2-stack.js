"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Myblogv2Stack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const origins = require("aws-cdk-lib/aws-cloudfront-origins");
const certmgr = require("aws-cdk-lib/aws-certificatemanager");
const iam = require("aws-cdk-lib/aws-iam");
const pipeline = require("aws-cdk-lib/aws-codepipeline");
const pipelineactions = require("aws-cdk-lib/aws-codepipeline-actions");
const codebuild = require("aws-cdk-lib/aws-codebuild");
const logs = require("aws-cdk-lib/aws-logs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const parameters_1 = require("./parameters");
const param = new parameters_1.MyBlogParamV2();
class Myblogv2Stack extends cdk.Stack {
    constructor(scope, id, props) {
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
        const apigwEndpoint = cdk.Fn.importValue("apigwDomainName");
        const websocketEndpoint = cdk.Fn.importValue("websocketDomainName");
        // const requestPolicy = new cloudfront.OriginRequestPolicy(this, "OriginRequestPolicy", {
        //   originRequestPolicyName: "AllowAPIGatewayFromCloudFront",
        //   headerBehavior: cloudfront.OriginRequestHeaderBehavior.all("Referer"),
        // });
        const distribution = new cloudfront.Distribution(this, "cloudfront", {
            defaultBehavior: {
                origin: new origins.S3Origin(s3Bucket),
                compress: true,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
            },
            additionalBehaviors: {
                "/api/*": {
                    origin: new origins.HttpOrigin(apigwEndpoint),
                    compress: true,
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                    originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
                    // originRequestPolicy: requestPolicy,
                },
                "/websocket/*": {
                    origin: new origins.HttpOrigin(websocketEndpoint),
                    compress: true,
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
                    originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
                    // originRequestPolicy: requestPolicy,
                },
            },
            certificate: certificate,
            defaultRootObject: "index.html",
            domainNames: ["dev.metalmental.net"],
            errorResponses: [
                {
                    httpStatus: 403,
                    ttl: aws_cdk_lib_1.Duration.seconds(5),
                    responseHttpStatus: 200,
                    responsePagePath: "/index.html",
                },
                {
                    httpStatus: 404,
                    ttl: aws_cdk_lib_1.Duration.seconds(5),
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
        const cfnDistribution = distribution.node.defaultChild;
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
exports.Myblogv2Stack = Myblogv2Stack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL215YmxvZ3YyLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyx5Q0FBeUM7QUFDekMseURBQXlEO0FBQ3pELDhEQUE4RDtBQUM5RCw4REFBOEQ7QUFDOUQsMkNBQTJDO0FBQzNDLHlEQUF5RDtBQUN6RCx3RUFBd0U7QUFDeEUsdURBQXVEO0FBQ3ZELDZDQUE2QztBQUU3Qyw2Q0FBdUM7QUFFdkMsNkNBQTZDO0FBRTdDLE1BQU0sS0FBSyxHQUFHLElBQUksMEJBQWEsRUFBRSxDQUFDO0FBRWxDLE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzFDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxrREFBa0Q7UUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRTtZQUN4RCxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVO1lBQy9CLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixnQkFBZ0IsRUFBRSxLQUFLO1NBQ3hCLENBQUMsQ0FBQztRQUNILHFCQUFxQjtRQUNyQixtQkFBbUI7UUFDbkIsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUM7UUFDdkQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDeEcsTUFBTSxhQUFh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RUFBRSxLQUFLO29CQUNkLE1BQU0sRUFBRTt3QkFDTixLQUFLLEVBQUU7NEJBQ0wsUUFBUSxFQUFFLENBQUMsY0FBYyxFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixRQUFRLENBQUMsVUFBVSxXQUFXLEVBQUUsOEJBQThCLEVBQUUsd0RBQXdELFlBQVksQ0FBQyxjQUFjLGVBQWUsQ0FBQzt5QkFDMU87cUJBQ0Y7aUJBQ0YsQ0FBQzthQUNILENBQUM7WUFDRixLQUFLLEVBQUUsV0FBVztTQUNuQixDQUFDLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFO1lBQzVFLFlBQVksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVk7WUFDekMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTTtZQUM1QyxZQUFZLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3RDLGNBQWMsRUFBRSxVQUFVO1lBQzFCLE1BQU0sRUFBRTtnQkFDTjtvQkFDRSxTQUFTLEVBQUUsUUFBUTtvQkFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2lCQUN4QjtnQkFDRDtvQkFDRSxTQUFTLEVBQUUsT0FBTztvQkFDbEIsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO2lCQUN2QjthQUNGO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBM0xELHNDQTJMQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCAqIGFzIHMzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jbG91ZGZyb250XCI7XG5pbXBvcnQgKiBhcyBvcmlnaW5zIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udC1vcmlnaW5zXCI7XG5pbXBvcnQgKiBhcyBjZXJ0bWdyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCAqIGFzIHBpcGVsaW5lIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY29kZXBpcGVsaW5lXCI7XG5pbXBvcnQgKiBhcyBwaXBlbGluZWFjdGlvbnMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jb2RlcGlwZWxpbmUtYWN0aW9uc1wiO1xuaW1wb3J0ICogYXMgY29kZWJ1aWxkIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY29kZWJ1aWxkXCI7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbG9nc1wiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5cbmltcG9ydCB7IE15QmxvZ1BhcmFtVjIgfSBmcm9tIFwiLi9wYXJhbWV0ZXJzXCI7XG5cbmNvbnN0IHBhcmFtID0gbmV3IE15QmxvZ1BhcmFtVjIoKTtcblxuZXhwb3J0IGNsYXNzIE15YmxvZ3YyU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBTMywgQ2xvdWRGcm9udCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICBjb25zdCBzM0J1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgcGFyYW0uczMuYnVja2V0TmFtZSwge1xuICAgICAgYnVja2V0TmFtZTogcGFyYW0uczMuYnVja2V0TmFtZSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICAgIGJ1Y2tldEtleUVuYWJsZWQ6IGZhbHNlLFxuICAgIH0pO1xuICAgIC8vIOiovOaYjuabuOOBr+OAgVJTQSAyMDQ444Gr44GZ44KL44GT44GoXG4gICAgLy8g44Oq44O844K444On44Oz44Gv44CBdXMtZWFzdC0xXG4gICAgY29uc3QgY2VydGlmaWNhdGVBcm4gPSBwYXJhbS5jbG91ZGZyb250LmNlcnRpZmljYXRlQXJuO1xuICAgIGNvbnN0IGNlcnRpZmljYXRlID0gY2VydG1nci5DZXJ0aWZpY2F0ZS5mcm9tQ2VydGlmaWNhdGVBcm4odGhpcywgXCJNeUJsb2dWMkNlcnRpZmljYXRlXCIsIGNlcnRpZmljYXRlQXJuKTtcbiAgICBjb25zdCBhcGlnd0VuZHBvaW50ID0gY2RrLkZuLmltcG9ydFZhbHVlKFwiYXBpZ3dEb21haW5OYW1lXCIpO1xuICAgIGNvbnN0IHdlYnNvY2tldEVuZHBvaW50ID0gY2RrLkZuLmltcG9ydFZhbHVlKFwid2Vic29ja2V0RG9tYWluTmFtZVwiKTtcbiAgICAvLyBjb25zdCByZXF1ZXN0UG9saWN5ID0gbmV3IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdFBvbGljeSh0aGlzLCBcIk9yaWdpblJlcXVlc3RQb2xpY3lcIiwge1xuICAgIC8vICAgb3JpZ2luUmVxdWVzdFBvbGljeU5hbWU6IFwiQWxsb3dBUElHYXRld2F5RnJvbUNsb3VkRnJvbnRcIixcbiAgICAvLyAgIGhlYWRlckJlaGF2aW9yOiBjbG91ZGZyb250Lk9yaWdpblJlcXVlc3RIZWFkZXJCZWhhdmlvci5hbGwoXCJSZWZlcmVyXCIpLFxuICAgIC8vIH0pO1xuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCBcImNsb3VkZnJvbnRcIiwge1xuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4oczNCdWNrZXQpLFxuICAgICAgICBjb21wcmVzczogdHJ1ZSxcbiAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgIGFsbG93ZWRNZXRob2RzOiBjbG91ZGZyb250LkFsbG93ZWRNZXRob2RzLkFMTE9XX0dFVF9IRUFEX09QVElPTlMsXG4gICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfT1BUSU1JWkVELFxuICAgICAgfSxcbiAgICAgIGFkZGl0aW9uYWxCZWhhdmlvcnM6IHtcbiAgICAgICAgXCIvYXBpLypcIjoge1xuICAgICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuSHR0cE9yaWdpbihhcGlnd0VuZHBvaW50KSxcbiAgICAgICAgICBjb21wcmVzczogdHJ1ZSxcbiAgICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgICBhbGxvd2VkTWV0aG9kczogY2xvdWRmcm9udC5BbGxvd2VkTWV0aG9kcy5BTExPV19BTEwsXG4gICAgICAgICAgY2FjaGVQb2xpY3k6IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kuQ0FDSElOR19ESVNBQkxFRCxcbiAgICAgICAgICBvcmlnaW5SZXF1ZXN0UG9saWN5OiBjbG91ZGZyb250Lk9yaWdpblJlcXVlc3RQb2xpY3kuQUxMX1ZJRVdFUl9FWENFUFRfSE9TVF9IRUFERVIsXG4gICAgICAgICAgLy8gb3JpZ2luUmVxdWVzdFBvbGljeTogcmVxdWVzdFBvbGljeSxcbiAgICAgICAgfSxcbiAgICAgICAgXCIvd2Vic29ja2V0LypcIjoge1xuICAgICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuSHR0cE9yaWdpbih3ZWJzb2NrZXRFbmRwb2ludCksXG4gICAgICAgICAgY29tcHJlc3M6IHRydWUsXG4gICAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgICAgYWxsb3dlZE1ldGhvZHM6IGNsb3VkZnJvbnQuQWxsb3dlZE1ldGhvZHMuQUxMT1dfQUxMLFxuICAgICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfRElTQUJMRUQsXG4gICAgICAgICAgb3JpZ2luUmVxdWVzdFBvbGljeTogY2xvdWRmcm9udC5PcmlnaW5SZXF1ZXN0UG9saWN5LkFMTF9WSUVXRVJfRVhDRVBUX0hPU1RfSEVBREVSLFxuICAgICAgICAgIC8vIG9yaWdpblJlcXVlc3RQb2xpY3k6IHJlcXVlc3RQb2xpY3ksXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgY2VydGlmaWNhdGU6IGNlcnRpZmljYXRlLFxuICAgICAgZGVmYXVsdFJvb3RPYmplY3Q6IFwiaW5kZXguaHRtbFwiLFxuICAgICAgZG9tYWluTmFtZXM6IFtcImRldi5tZXRhbG1lbnRhbC5uZXRcIl0sXG4gICAgICBlcnJvclJlc3BvbnNlczogW1xuICAgICAgICB7XG4gICAgICAgICAgaHR0cFN0YXR1czogNDAzLFxuICAgICAgICAgIHR0bDogRHVyYXRpb24uc2Vjb25kcyg1KSxcbiAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiBcIi9pbmRleC5odG1sXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBodHRwU3RhdHVzOiA0MDQsXG4gICAgICAgICAgdHRsOiBEdXJhdGlvbi5zZWNvbmRzKDUpLFxuICAgICAgICAgIHJlc3BvbnNlSHR0cFN0YXR1czogMjAwLFxuICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6IFwiL2luZGV4Lmh0bWxcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBodHRwVmVyc2lvbjogY2xvdWRmcm9udC5IdHRwVmVyc2lvbi5IVFRQMl9BTkRfMyxcbiAgICAgIG1pbmltdW1Qcm90b2NvbFZlcnNpb246IGNsb3VkZnJvbnQuU2VjdXJpdHlQb2xpY3lQcm90b2NvbC5UTFNfVjFfMl8yMDIxLFxuICAgICAgcHJpY2VDbGFzczogY2xvdWRmcm9udC5QcmljZUNsYXNzLlBSSUNFX0NMQVNTX0FMTCxcbiAgICB9KTtcbiAgICBjb25zdCBvYWMgPSBuZXcgY2xvdWRmcm9udC5DZm5PcmlnaW5BY2Nlc3NDb250cm9sKHRoaXMsIHBhcmFtLmNsb3VkZnJvbnQub2FjTmFtZSwge1xuICAgICAgb3JpZ2luQWNjZXNzQ29udHJvbENvbmZpZzoge1xuICAgICAgICBuYW1lOiBwYXJhbS5jbG91ZGZyb250Lm9hY05hbWUsXG4gICAgICAgIG9yaWdpbkFjY2Vzc0NvbnRyb2xPcmlnaW5UeXBlOiBcInMzXCIsXG4gICAgICAgIHNpZ25pbmdCZWhhdmlvcjogXCJhbHdheXNcIixcbiAgICAgICAgc2lnbmluZ1Byb3RvY29sOiBcInNpZ3Y0XCIsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGNmbkRpc3RyaWJ1dGlvbiA9IGRpc3RyaWJ1dGlvbi5ub2RlLmRlZmF1bHRDaGlsZCBhcyBjbG91ZGZyb250LkNmbkRpc3RyaWJ1dGlvbjtcbiAgICBjZm5EaXN0cmlidXRpb24uYWRkUHJvcGVydHlPdmVycmlkZShcIkRpc3RyaWJ1dGlvbkNvbmZpZy5PcmlnaW5zLjAuUzNPcmlnaW5Db25maWcuT3JpZ2luQWNjZXNzSWRlbnRpdHlcIiwgXCJcIik7XG4gICAgY2ZuRGlzdHJpYnV0aW9uLmFkZFByb3BlcnR5T3ZlcnJpZGUoXCJEaXN0cmlidXRpb25Db25maWcuT3JpZ2lucy4wLk9yaWdpbkFjY2Vzc0NvbnRyb2xJZFwiLCBvYWMuYXR0cklkKTtcbiAgICBjb25zdCBzM0J1Y2tldFBvbGljeSA9IG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFtcInMzOkdldE9iamVjdFwiXSxcbiAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgIHByaW5jaXBhbHM6IFtuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoXCJjbG91ZGZyb250LmFtYXpvbmF3cy5jb21cIildLFxuICAgICAgcmVzb3VyY2VzOiBbYCR7czNCdWNrZXQuYnVja2V0QXJufS8qYF0sXG4gICAgfSk7XG4gICAgczNCdWNrZXRQb2xpY3kuYWRkQ29uZGl0aW9uKFwiU3RyaW5nRXF1YWxzXCIsIHtcbiAgICAgIFwiQVdTOlNvdXJjZUFyblwiOiBgYXJuOmF3czpjbG91ZGZyb250Ojoke3RoaXMuYWNjb3VudH06ZGlzdHJpYnV0aW9uLyR7ZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbklkfWAsXG4gICAgfSk7XG4gICAgczNCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShzM0J1Y2tldFBvbGljeSk7XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBHaXRIdWIgLSBDb2RlUGlwZWxpbmUgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICBjb25zdCBzM0FydGlmYWN0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBwYXJhbS5waXBlbGluZS5zM05hbWUsIHtcbiAgICAgIGJ1Y2tldE5hbWU6IHBhcmFtLnBpcGVsaW5lLnMzTmFtZSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICAgIGJ1Y2tldEtleUVuYWJsZWQ6IGZhbHNlLFxuICAgICAgbGlmZWN5Y2xlUnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGV4cGlyYXRpb246IGNkay5EdXJhdGlvbi5kYXlzKDEpLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgICBjb25zdCBidWlsZE91dHB1dCA9IG5ldyBwaXBlbGluZS5BcnRpZmFjdCgpO1xuICAgIGNvbnN0IHNvdXJjZUFjdGlvbiA9IG5ldyBwaXBlbGluZWFjdGlvbnMuQ29kZVN0YXJDb25uZWN0aW9uc1NvdXJjZUFjdGlvbih7XG4gICAgICBhY3Rpb25OYW1lOiBcIkdpdEh1YlwiLFxuICAgICAgb3duZXI6IFwiRmx1cGlub2NoYW5cIixcbiAgICAgIHJlcG86IFwiTXlCbG9nVjJcIixcbiAgICAgIGJyYW5jaDogXCJtYXN0ZXJcIixcbiAgICAgIG91dHB1dDogYnVpbGRPdXRwdXQsXG4gICAgICBjb25uZWN0aW9uQXJuOiBwYXJhbS5waXBlbGluZS5jb2Rlc3RhckNvbm5lY3Rpb25Bcm4sXG4gICAgfSk7XG4gICAgY29uc3QgY29kZWJ1aWxkTG9ncyA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsIHBhcmFtLnBpcGVsaW5lLmNvZGVidWlsZExvZ3NOYW1lLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IHBhcmFtLnBpcGVsaW5lLmNvZGVidWlsZExvZ3NOYW1lLFxuICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAgIGxvZ0dyb3VwQ2xhc3M6IGxvZ3MuTG9nR3JvdXBDbGFzcy5TVEFOREFSRCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG4gICAgY29uc3QgY29kZWJ1aWxkUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGRSb2xlTmFtZSwge1xuICAgICAgcm9sZU5hbWU6IHBhcmFtLnBpcGVsaW5lLmNvZGVidWlsZFJvbGVOYW1lLFxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoXCJjb2RlYnVpbGQuYW1hem9uYXdzLmNvbVwiKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW2lhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFXU0NvZGVCdWlsZEFkbWluQWNjZXNzXCIpXSxcbiAgICAgIGlubGluZVBvbGljaWVzOiB7XG4gICAgICAgIGlubGluZVBvbGljeTogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcInMzOipcIl0sXG4gICAgICAgICAgICAgIHJlc291cmNlczogW2Ake3MzQnVja2V0LmJ1Y2tldEFybn1gLCBgJHtzM0J1Y2tldC5idWNrZXRBcm59LypgXSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcImNsb3VkZnJvbnQ6KlwiXSxcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbYGFybjphd3M6Y2xvdWRmcm9udDo6JHt0aGlzLmFjY291bnR9OmRpc3RyaWJ1dGlvbi8ke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZH1gXSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBidWlsZEFjdGlvbiA9IG5ldyBwaXBlbGluZWFjdGlvbnMuQ29kZUJ1aWxkQWN0aW9uKHtcbiAgICAgIGFjdGlvbk5hbWU6IFwiQnVpbGRcIixcbiAgICAgIHByb2plY3Q6IG5ldyBjb2RlYnVpbGQuUGlwZWxpbmVQcm9qZWN0KHRoaXMsIHBhcmFtLnBpcGVsaW5lLmNvZGVidWlsZE5hbWUsIHtcbiAgICAgICAgcHJvamVjdE5hbWU6IHBhcmFtLnBpcGVsaW5lLmNvZGVidWlsZE5hbWUsXG4gICAgICAgIHJvbGU6IGNvZGVidWlsZFJvbGUsXG4gICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgY29tcHV0ZVR5cGU6IGNvZGVidWlsZC5Db21wdXRlVHlwZS5TTUFMTCxcbiAgICAgICAgICBidWlsZEltYWdlOiBjb2RlYnVpbGQuTGludXhCdWlsZEltYWdlLkFNQVpPTl9MSU5VWF8yXzUsXG4gICAgICAgICAgcHJpdmlsZWdlZDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgbG9nZ2luZzoge1xuICAgICAgICAgIGNsb3VkV2F0Y2g6IHtcbiAgICAgICAgICAgIGxvZ0dyb3VwOiBjb2RlYnVpbGRMb2dzLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGJ1aWxkU3BlYzogY29kZWJ1aWxkLkJ1aWxkU3BlYy5mcm9tT2JqZWN0KHtcbiAgICAgICAgICB2ZXJzaW9uOiBcIjAuMlwiLFxuICAgICAgICAgIHBoYXNlczoge1xuICAgICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgICAgY29tbWFuZHM6IFtcImVjaG8gczMgc3luY1wiLCBcImNkIC4vcmVhY3QvYnVpbGQvXCIsIGBhd3MgczMgc3luYyAuIHMzOi8vJHtzM0J1Y2tldC5idWNrZXROYW1lfSAtLWRlbGV0ZWAsIFwiZWNobyByZW1vdmUgY2xvdWRmcm9udCBjYWNoZVwiLCBgYXdzIGNsb3VkZnJvbnQgY3JlYXRlLWludmFsaWRhdGlvbiAtLWRpc3RyaWJ1dGlvbi1pZCAke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZH0gLS1wYXRocyBcIi8qXCJgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICB9KSxcbiAgICAgIGlucHV0OiBidWlsZE91dHB1dCxcbiAgICB9KTtcbiAgICBjb25zdCBjb2RlUGlwZWxpbmUgPSBuZXcgcGlwZWxpbmUuUGlwZWxpbmUodGhpcywgcGFyYW0ucGlwZWxpbmUucGlwZWxpbmVOYW1lLCB7XG4gICAgICBwaXBlbGluZU5hbWU6IHBhcmFtLnBpcGVsaW5lLnBpcGVsaW5lTmFtZSxcbiAgICAgIGV4ZWN1dGlvbk1vZGU6IHBpcGVsaW5lLkV4ZWN1dGlvbk1vZGUuUVVFVUVELFxuICAgICAgcGlwZWxpbmVUeXBlOiBwaXBlbGluZS5QaXBlbGluZVR5cGUuVjIsXG4gICAgICBhcnRpZmFjdEJ1Y2tldDogczNBcnRpZmFjdCxcbiAgICAgIHN0YWdlczogW1xuICAgICAgICB7XG4gICAgICAgICAgc3RhZ2VOYW1lOiBcIlNvdXJjZVwiLFxuICAgICAgICAgIGFjdGlvbnM6IFtzb3VyY2VBY3Rpb25dLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc3RhZ2VOYW1lOiBcIkJ1aWxkXCIsXG4gICAgICAgICAgYWN0aW9uczogW2J1aWxkQWN0aW9uXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==