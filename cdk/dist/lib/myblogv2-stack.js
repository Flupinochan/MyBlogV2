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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL215YmxvZ3YyLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyx5Q0FBeUM7QUFDekMseURBQXlEO0FBQ3pELDhEQUE4RDtBQUM5RCw4REFBOEQ7QUFDOUQsMkNBQTJDO0FBQzNDLHlEQUF5RDtBQUN6RCx3RUFBd0U7QUFDeEUsdURBQXVEO0FBQ3ZELDZDQUE2QztBQUU3Qyw2Q0FBdUM7QUFFdkMsNkNBQTZDO0FBRTdDLE1BQU0sS0FBSyxHQUFHLElBQUksMEJBQWEsRUFBRSxDQUFDO0FBRWxDLE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzFDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxrREFBa0Q7UUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRTtZQUN4RCxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVO1lBQy9CLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixnQkFBZ0IsRUFBRSxLQUFLO1NBQ3hCLENBQUMsQ0FBQztRQUNILHFCQUFxQjtRQUNyQixtQkFBbUI7UUFDbkIsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUM7UUFDdkQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDeEcsTUFBTSxhQUFh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YUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTTtZQUM1QyxZQUFZLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3RDLGNBQWMsRUFBRSxVQUFVO1lBQzFCLE1BQU0sRUFBRTtnQkFDTjtvQkFDRSxTQUFTLEVBQUUsUUFBUTtvQkFDbkIsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2lCQUN4QjtnQkFDRDtvQkFDRSxTQUFTLEVBQUUsT0FBTztvQkFDbEIsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO2lCQUN2QjthQUNGO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBakxELHNDQWlMQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCAqIGFzIHMzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcbmltcG9ydCAqIGFzIGNsb3VkZnJvbnQgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jbG91ZGZyb250XCI7XG5pbXBvcnQgKiBhcyBvcmlnaW5zIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udC1vcmlnaW5zXCI7XG5pbXBvcnQgKiBhcyBjZXJ0bWdyIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyXCI7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1pYW1cIjtcbmltcG9ydCAqIGFzIHBpcGVsaW5lIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY29kZXBpcGVsaW5lXCI7XG5pbXBvcnQgKiBhcyBwaXBlbGluZWFjdGlvbnMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jb2RlcGlwZWxpbmUtYWN0aW9uc1wiO1xuaW1wb3J0ICogYXMgY29kZWJ1aWxkIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY29kZWJ1aWxkXCI7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbG9nc1wiO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XG5cbmltcG9ydCB7IE15QmxvZ1BhcmFtVjIgfSBmcm9tIFwiLi9wYXJhbWV0ZXJzXCI7XG5cbmNvbnN0IHBhcmFtID0gbmV3IE15QmxvZ1BhcmFtVjIoKTtcblxuZXhwb3J0IGNsYXNzIE15YmxvZ3YyU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBTMywgQ2xvdWRGcm9udCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICBjb25zdCBzM0J1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgcGFyYW0uczMuYnVja2V0TmFtZSwge1xuICAgICAgYnVja2V0TmFtZTogcGFyYW0uczMuYnVja2V0TmFtZSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICAgIGJ1Y2tldEtleUVuYWJsZWQ6IGZhbHNlLFxuICAgIH0pO1xuICAgIC8vIOiovOaYjuabuOOBr+OAgVJTQSAyMDQ444Gr44GZ44KL44GT44GoXG4gICAgLy8g44Oq44O844K444On44Oz44Gv44CBdXMtZWFzdC0xXG4gICAgY29uc3QgY2VydGlmaWNhdGVBcm4gPSBwYXJhbS5jbG91ZGZyb250LmNlcnRpZmljYXRlQXJuO1xuICAgIGNvbnN0IGNlcnRpZmljYXRlID0gY2VydG1nci5DZXJ0aWZpY2F0ZS5mcm9tQ2VydGlmaWNhdGVBcm4odGhpcywgXCJNeUJsb2dWMkNlcnRpZmljYXRlXCIsIGNlcnRpZmljYXRlQXJuKTtcbiAgICBjb25zdCBhcGlnd0VuZHBvaW50ID0gY2RrLkZuLmltcG9ydFZhbHVlKFwiYXBpZ3dEb21haW5OYW1lXCIpO1xuICAgIC8vIGNvbnN0IHJlcXVlc3RQb2xpY3kgPSBuZXcgY2xvdWRmcm9udC5PcmlnaW5SZXF1ZXN0UG9saWN5KHRoaXMsIFwiT3JpZ2luUmVxdWVzdFBvbGljeVwiLCB7XG4gICAgLy8gICBvcmlnaW5SZXF1ZXN0UG9saWN5TmFtZTogXCJBbGxvd0FQSUdhdGV3YXlGcm9tQ2xvdWRGcm9udFwiLFxuICAgIC8vICAgaGVhZGVyQmVoYXZpb3I6IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdEhlYWRlckJlaGF2aW9yLmFsbChcIlJlZmVyZXJcIiksXG4gICAgLy8gfSk7XG4gICAgY29uc3QgZGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKHRoaXMsIFwiY2xvdWRmcm9udFwiLCB7XG4gICAgICBkZWZhdWx0QmVoYXZpb3I6IHtcbiAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbihzM0J1Y2tldCksXG4gICAgICAgIGNvbXByZXNzOiB0cnVlLFxuICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgYWxsb3dlZE1ldGhvZHM6IGNsb3VkZnJvbnQuQWxsb3dlZE1ldGhvZHMuQUxMT1dfR0VUX0hFQURfT1BUSU9OUyxcbiAgICAgICAgY2FjaGVQb2xpY3k6IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kuQ0FDSElOR19PUFRJTUlaRUQsXG4gICAgICB9LFxuICAgICAgYWRkaXRpb25hbEJlaGF2aW9yczoge1xuICAgICAgICBcIi9hcGkvKlwiOiB7XG4gICAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5IdHRwT3JpZ2luKGFwaWd3RW5kcG9pbnQpLFxuICAgICAgICAgIGNvbXByZXNzOiB0cnVlLFxuICAgICAgICAgIHZpZXdlclByb3RvY29sUG9saWN5OiBjbG91ZGZyb250LlZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuICAgICAgICAgIGFsbG93ZWRNZXRob2RzOiBjbG91ZGZyb250LkFsbG93ZWRNZXRob2RzLkFMTE9XX0FMTCxcbiAgICAgICAgICBjYWNoZVBvbGljeTogY2xvdWRmcm9udC5DYWNoZVBvbGljeS5DQUNISU5HX0RJU0FCTEVELFxuICAgICAgICAgIG9yaWdpblJlcXVlc3RQb2xpY3k6IGNsb3VkZnJvbnQuT3JpZ2luUmVxdWVzdFBvbGljeS5BTExfVklFV0VSX0VYQ0VQVF9IT1NUX0hFQURFUixcbiAgICAgICAgICAvLyBvcmlnaW5SZXF1ZXN0UG9saWN5OiByZXF1ZXN0UG9saWN5LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGNlcnRpZmljYXRlOiBjZXJ0aWZpY2F0ZSxcbiAgICAgIGRlZmF1bHRSb290T2JqZWN0OiBcImluZGV4Lmh0bWxcIixcbiAgICAgIGRvbWFpbk5hbWVzOiBbXCJkZXYubWV0YWxtZW50YWwubmV0XCJdLFxuICAgICAgZXJyb3JSZXNwb25zZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGh0dHBTdGF0dXM6IDQwMyxcbiAgICAgICAgICB0dGw6IER1cmF0aW9uLnNlY29uZHMoNSksXG4gICAgICAgICAgcmVzcG9uc2VIdHRwU3RhdHVzOiAyMDAsXG4gICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogXCIvaW5kZXguaHRtbFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaHR0cFN0YXR1czogNDA0LFxuICAgICAgICAgIHR0bDogRHVyYXRpb24uc2Vjb25kcyg1KSxcbiAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiBcIi9pbmRleC5odG1sXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgaHR0cFZlcnNpb246IGNsb3VkZnJvbnQuSHR0cFZlcnNpb24uSFRUUDJfQU5EXzMsXG4gICAgICBtaW5pbXVtUHJvdG9jb2xWZXJzaW9uOiBjbG91ZGZyb250LlNlY3VyaXR5UG9saWN5UHJvdG9jb2wuVExTX1YxXzJfMjAyMSxcbiAgICAgIHByaWNlQ2xhc3M6IGNsb3VkZnJvbnQuUHJpY2VDbGFzcy5QUklDRV9DTEFTU19BTEwsXG4gICAgfSk7XG4gICAgY29uc3Qgb2FjID0gbmV3IGNsb3VkZnJvbnQuQ2ZuT3JpZ2luQWNjZXNzQ29udHJvbCh0aGlzLCBwYXJhbS5jbG91ZGZyb250Lm9hY05hbWUsIHtcbiAgICAgIG9yaWdpbkFjY2Vzc0NvbnRyb2xDb25maWc6IHtcbiAgICAgICAgbmFtZTogcGFyYW0uY2xvdWRmcm9udC5vYWNOYW1lLFxuICAgICAgICBvcmlnaW5BY2Nlc3NDb250cm9sT3JpZ2luVHlwZTogXCJzM1wiLFxuICAgICAgICBzaWduaW5nQmVoYXZpb3I6IFwiYWx3YXlzXCIsXG4gICAgICAgIHNpZ25pbmdQcm90b2NvbDogXCJzaWd2NFwiLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBjZm5EaXN0cmlidXRpb24gPSBkaXN0cmlidXRpb24ubm9kZS5kZWZhdWx0Q2hpbGQgYXMgY2xvdWRmcm9udC5DZm5EaXN0cmlidXRpb247XG4gICAgY2ZuRGlzdHJpYnV0aW9uLmFkZFByb3BlcnR5T3ZlcnJpZGUoXCJEaXN0cmlidXRpb25Db25maWcuT3JpZ2lucy4wLlMzT3JpZ2luQ29uZmlnLk9yaWdpbkFjY2Vzc0lkZW50aXR5XCIsIFwiXCIpO1xuICAgIGNmbkRpc3RyaWJ1dGlvbi5hZGRQcm9wZXJ0eU92ZXJyaWRlKFwiRGlzdHJpYnV0aW9uQ29uZmlnLk9yaWdpbnMuMC5PcmlnaW5BY2Nlc3NDb250cm9sSWRcIiwgb2FjLmF0dHJJZCk7XG4gICAgY29uc3QgczNCdWNrZXRQb2xpY3kgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBhY3Rpb25zOiBbXCJzMzpHZXRPYmplY3RcIl0sXG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBwcmluY2lwYWxzOiBbbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwiY2xvdWRmcm9udC5hbWF6b25hd3MuY29tXCIpXSxcbiAgICAgIHJlc291cmNlczogW2Ake3MzQnVja2V0LmJ1Y2tldEFybn0vKmBdLFxuICAgIH0pO1xuICAgIHMzQnVja2V0UG9saWN5LmFkZENvbmRpdGlvbihcIlN0cmluZ0VxdWFsc1wiLCB7XG4gICAgICBcIkFXUzpTb3VyY2VBcm5cIjogYGFybjphd3M6Y2xvdWRmcm9udDo6JHt0aGlzLmFjY291bnR9OmRpc3RyaWJ1dGlvbi8ke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZH1gLFxuICAgIH0pO1xuICAgIHMzQnVja2V0LmFkZFRvUmVzb3VyY2VQb2xpY3koczNCdWNrZXRQb2xpY3kpO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gR2l0SHViIC0gQ29kZVBpcGVsaW5lICAgICAgICAgICAgICAgICAgICAgIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgY29uc3QgczNBcnRpZmFjdCA9IG5ldyBzMy5CdWNrZXQodGhpcywgcGFyYW0ucGlwZWxpbmUuczNOYW1lLCB7XG4gICAgICBidWNrZXROYW1lOiBwYXJhbS5waXBlbGluZS5zM05hbWUsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWUsXG4gICAgICBidWNrZXRLZXlFbmFibGVkOiBmYWxzZSxcbiAgICAgIGxpZmVjeWNsZVJ1bGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBleHBpcmF0aW9uOiBjZGsuRHVyYXRpb24uZGF5cygxKSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gICAgY29uc3QgYnVpbGRPdXRwdXQgPSBuZXcgcGlwZWxpbmUuQXJ0aWZhY3QoKTtcbiAgICBjb25zdCBzb3VyY2VBY3Rpb24gPSBuZXcgcGlwZWxpbmVhY3Rpb25zLkNvZGVTdGFyQ29ubmVjdGlvbnNTb3VyY2VBY3Rpb24oe1xuICAgICAgYWN0aW9uTmFtZTogXCJHaXRIdWJcIixcbiAgICAgIG93bmVyOiBcIkZsdXBpbm9jaGFuXCIsXG4gICAgICByZXBvOiBcIk15QmxvZ1YyXCIsXG4gICAgICBicmFuY2g6IFwibWFzdGVyXCIsXG4gICAgICBvdXRwdXQ6IGJ1aWxkT3V0cHV0LFxuICAgICAgY29ubmVjdGlvbkFybjogcGFyYW0ucGlwZWxpbmUuY29kZXN0YXJDb25uZWN0aW9uQXJuLFxuICAgIH0pO1xuICAgIGNvbnN0IGNvZGVidWlsZExvZ3MgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGRMb2dzTmFtZSwge1xuICAgICAgbG9nR3JvdXBOYW1lOiBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGRMb2dzTmFtZSxcbiAgICAgIHJldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9EQVksXG4gICAgICBsb2dHcm91cENsYXNzOiBsb2dzLkxvZ0dyb3VwQ2xhc3MuU1RBTkRBUkQsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuICAgIGNvbnN0IGNvZGVidWlsZFJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgcGFyYW0ucGlwZWxpbmUuY29kZWJ1aWxkUm9sZU5hbWUsIHtcbiAgICAgIHJvbGVOYW1lOiBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGRSb2xlTmFtZSxcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwiY29kZWJ1aWxkLmFtYXpvbmF3cy5jb21cIiksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NDb2RlQnVpbGRBZG1pbkFjY2Vzc1wiKV0sXG4gICAgICBpbmxpbmVQb2xpY2llczoge1xuICAgICAgICBpbmxpbmVQb2xpY3k6IG5ldyBpYW0uUG9saWN5RG9jdW1lbnQoe1xuICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXCJzMzoqXCJdLFxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFtgJHtzM0J1Y2tldC5idWNrZXRBcm59YCwgYCR7czNCdWNrZXQuYnVja2V0QXJufS8qYF0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXCJjbG91ZGZyb250OipcIl0sXG4gICAgICAgICAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmNsb3VkZnJvbnQ6OiR7dGhpcy5hY2NvdW50fTpkaXN0cmlidXRpb24vJHtkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWR9YF0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgYnVpbGRBY3Rpb24gPSBuZXcgcGlwZWxpbmVhY3Rpb25zLkNvZGVCdWlsZEFjdGlvbih7XG4gICAgICBhY3Rpb25OYW1lOiBcIkJ1aWxkXCIsXG4gICAgICBwcm9qZWN0OiBuZXcgY29kZWJ1aWxkLlBpcGVsaW5lUHJvamVjdCh0aGlzLCBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGROYW1lLCB7XG4gICAgICAgIHByb2plY3ROYW1lOiBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGROYW1lLFxuICAgICAgICByb2xlOiBjb2RlYnVpbGRSb2xlLFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIGNvbXB1dGVUeXBlOiBjb2RlYnVpbGQuQ29tcHV0ZVR5cGUuU01BTEwsXG4gICAgICAgICAgYnVpbGRJbWFnZTogY29kZWJ1aWxkLkxpbnV4QnVpbGRJbWFnZS5BTUFaT05fTElOVVhfMl81LFxuICAgICAgICAgIHByaXZpbGVnZWQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGxvZ2dpbmc6IHtcbiAgICAgICAgICBjbG91ZFdhdGNoOiB7XG4gICAgICAgICAgICBsb2dHcm91cDogY29kZWJ1aWxkTG9ncyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBidWlsZFNwZWM6IGNvZGVidWlsZC5CdWlsZFNwZWMuZnJvbU9iamVjdCh7XG4gICAgICAgICAgdmVyc2lvbjogXCIwLjJcIixcbiAgICAgICAgICBwaGFzZXM6IHtcbiAgICAgICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgICAgIGNvbW1hbmRzOiBbXCJlY2hvIHMzIHN5bmNcIiwgXCJjZCAuL3JlYWN0L2J1aWxkL1wiLCBgYXdzIHMzIHN5bmMgLiBzMzovLyR7czNCdWNrZXQuYnVja2V0TmFtZX0gLS1kZWxldGVgLCBcImVjaG8gcmVtb3ZlIGNsb3VkZnJvbnQgY2FjaGVcIiwgYGF3cyBjbG91ZGZyb250IGNyZWF0ZS1pbnZhbGlkYXRpb24gLS1kaXN0cmlidXRpb24taWQgJHtkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWR9IC0tcGF0aHMgXCIvKlwiYF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgICAgfSksXG4gICAgICBpbnB1dDogYnVpbGRPdXRwdXQsXG4gICAgfSk7XG4gICAgY29uc3QgY29kZVBpcGVsaW5lID0gbmV3IHBpcGVsaW5lLlBpcGVsaW5lKHRoaXMsIHBhcmFtLnBpcGVsaW5lLnBpcGVsaW5lTmFtZSwge1xuICAgICAgcGlwZWxpbmVOYW1lOiBwYXJhbS5waXBlbGluZS5waXBlbGluZU5hbWUsXG4gICAgICBleGVjdXRpb25Nb2RlOiBwaXBlbGluZS5FeGVjdXRpb25Nb2RlLlFVRVVFRCxcbiAgICAgIHBpcGVsaW5lVHlwZTogcGlwZWxpbmUuUGlwZWxpbmVUeXBlLlYyLFxuICAgICAgYXJ0aWZhY3RCdWNrZXQ6IHMzQXJ0aWZhY3QsXG4gICAgICBzdGFnZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHN0YWdlTmFtZTogXCJTb3VyY2VcIixcbiAgICAgICAgICBhY3Rpb25zOiBbc291cmNlQWN0aW9uXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHN0YWdlTmFtZTogXCJCdWlsZFwiLFxuICAgICAgICAgIGFjdGlvbnM6IFtidWlsZEFjdGlvbl0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG59XG4iXX0=