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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGliL215YmxvZ3YyLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyx5Q0FBeUM7QUFDekMseURBQXlEO0FBQ3pELDhEQUE4RDtBQUM5RCw4REFBOEQ7QUFDOUQsMkNBQTJDO0FBQzNDLHlEQUF5RDtBQUN6RCx3RUFBd0U7QUFDeEUsdURBQXVEO0FBQ3ZELDZDQUE2QztBQUU3Qyw2Q0FBdUM7QUFFdkMsNkNBQTZDO0FBRTdDLE1BQU0sS0FBSyxHQUFHLElBQUksMEJBQWEsRUFBRSxDQUFDO0FBRWxDLE1BQWEsYUFBYyxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzFDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxrREFBa0Q7UUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRTtZQUN4RCxVQUFVLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVO1lBQy9CLGFBQWEsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLE9BQU87WUFDeEMsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixnQkFBZ0IsRUFBRSxLQUFLO1NBQ3hCLENBQUMsQ0FBQztRQUNILHFCQUFxQjtRQUNyQixtQkFBbUI7UUFDbkIsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUM7UUFDdkQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDeEcsTUFBTSxZQUFZ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QUNQLFVBQVUsRUFBRTt3QkFDVixRQUFRLEVBQUUsYUFBYTtxQkFDeEI7aUJBQ0Y7Z0JBQ0QsU0FBUyxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDO29CQUN4QyxPQUFPLEVBQUUsS0FBSztvQkFDZCxNQUFNLEVBQUU7d0JBQ04sS0FBSyxFQUFFOzRCQUNMLFFBQVEsRUFBRSxDQUFDLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxzQkFBc0IsUUFBUSxDQUFDLFVBQVUsV0FBVyxFQUFFLDhCQUE4QixFQUFFLHdEQUF3RCxZQUFZLENBQUMsY0FBYyxlQUFlLENBQUM7eUJBQzFPO3FCQUNGO2lCQUNGLENBQUM7YUFDSCxDQUFDO1lBQ0YsS0FBSyxFQUFFLFdBQVc7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxZQUFZLEdBQUcsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRTtZQUM1RSxZQUFZLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZO1lBQ3pDLGFBQWEsRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU07WUFDNUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN0QyxjQUFjLEVBQUUsVUFBVTtZQUMxQixNQUFNLEVBQUU7Z0JBQ047b0JBQ0UsU0FBUyxFQUFFLFFBQVE7b0JBQ25CLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztpQkFDeEI7Z0JBQ0Q7b0JBQ0UsU0FBUyxFQUFFLE9BQU87b0JBQ2xCLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQztpQkFDdkI7YUFDRjtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQWpLRCxzQ0FpS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSBcImF3cy1jZGstbGliXCI7XG5pbXBvcnQgKiBhcyBzMyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCI7XG5pbXBvcnQgKiBhcyBjbG91ZGZyb250IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udFwiO1xuaW1wb3J0ICogYXMgb3JpZ2lucyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQtb3JpZ2luc1wiO1xuaW1wb3J0ICogYXMgY2VydG1nciBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNlcnRpZmljYXRlbWFuYWdlclwiO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgKiBhcyBwaXBlbGluZSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNvZGVwaXBlbGluZVwiO1xuaW1wb3J0ICogYXMgcGlwZWxpbmVhY3Rpb25zIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtY29kZXBpcGVsaW5lLWFjdGlvbnNcIjtcbmltcG9ydCAqIGFzIGNvZGVidWlsZCBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNvZGVidWlsZFwiO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWxvZ3NcIjtcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuXG5pbXBvcnQgeyBNeUJsb2dQYXJhbVYyIH0gZnJvbSBcIi4vcGFyYW1ldGVyc1wiO1xuXG5jb25zdCBwYXJhbSA9IG5ldyBNeUJsb2dQYXJhbVYyKCk7XG5cbmV4cG9ydCBjbGFzcyBNeWJsb2d2MlN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gUzMsIENsb3VkRnJvbnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgY29uc3QgczNCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsIHBhcmFtLnMzLmJ1Y2tldE5hbWUsIHtcbiAgICAgIGJ1Y2tldE5hbWU6IHBhcmFtLnMzLmJ1Y2tldE5hbWUsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWUsXG4gICAgICBidWNrZXRLZXlFbmFibGVkOiBmYWxzZSxcbiAgICB9KTtcbiAgICAvLyDoqLzmmI7mm7jjga/jgIFSU0EgMjA0OOOBq+OBmeOCi+OBk+OBqFxuICAgIC8vIOODquODvOOCuOODp+ODs+OBr+OAgXVzLWVhc3QtMVxuICAgIGNvbnN0IGNlcnRpZmljYXRlQXJuID0gcGFyYW0uY2xvdWRmcm9udC5jZXJ0aWZpY2F0ZUFybjtcbiAgICBjb25zdCBjZXJ0aWZpY2F0ZSA9IGNlcnRtZ3IuQ2VydGlmaWNhdGUuZnJvbUNlcnRpZmljYXRlQXJuKHRoaXMsIFwiTXlCbG9nVjJDZXJ0aWZpY2F0ZVwiLCBjZXJ0aWZpY2F0ZUFybik7XG4gICAgY29uc3QgZGlzdHJpYnV0aW9uID0gbmV3IGNsb3VkZnJvbnQuRGlzdHJpYnV0aW9uKHRoaXMsIFwiY2xvdWRmcm9udFwiLCB7XG4gICAgICBkZWZhdWx0QmVoYXZpb3I6IHtcbiAgICAgICAgb3JpZ2luOiBuZXcgb3JpZ2lucy5TM09yaWdpbihzM0J1Y2tldCksXG4gICAgICAgIGNvbXByZXNzOiB0cnVlLFxuICAgICAgICB2aWV3ZXJQcm90b2NvbFBvbGljeTogY2xvdWRmcm9udC5WaWV3ZXJQcm90b2NvbFBvbGljeS5SRURJUkVDVF9UT19IVFRQUyxcbiAgICAgICAgYWxsb3dlZE1ldGhvZHM6IGNsb3VkZnJvbnQuQWxsb3dlZE1ldGhvZHMuQUxMT1dfR0VUX0hFQURfT1BUSU9OUyxcbiAgICAgICAgY2FjaGVQb2xpY3k6IGNsb3VkZnJvbnQuQ2FjaGVQb2xpY3kuQ0FDSElOR19PUFRJTUlaRUQsXG4gICAgICB9LFxuICAgICAgY2VydGlmaWNhdGU6IGNlcnRpZmljYXRlLFxuICAgICAgZGVmYXVsdFJvb3RPYmplY3Q6IFwiaW5kZXguaHRtbFwiLFxuICAgICAgZG9tYWluTmFtZXM6IFtcImRldi5tZXRhbG1lbnRhbC5uZXRcIl0sXG4gICAgICBlcnJvclJlc3BvbnNlczogW1xuICAgICAgICB7XG4gICAgICAgICAgaHR0cFN0YXR1czogNDAzLFxuICAgICAgICAgIHR0bDogRHVyYXRpb24uc2Vjb25kcyg1KSxcbiAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiBcIi9pbmRleC5odG1sXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBodHRwU3RhdHVzOiA0MDQsXG4gICAgICAgICAgdHRsOiBEdXJhdGlvbi5zZWNvbmRzKDUpLFxuICAgICAgICAgIHJlc3BvbnNlSHR0cFN0YXR1czogMjAwLFxuICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6IFwiL2luZGV4Lmh0bWxcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBodHRwVmVyc2lvbjogY2xvdWRmcm9udC5IdHRwVmVyc2lvbi5IVFRQMl9BTkRfMyxcbiAgICAgIG1pbmltdW1Qcm90b2NvbFZlcnNpb246IGNsb3VkZnJvbnQuU2VjdXJpdHlQb2xpY3lQcm90b2NvbC5UTFNfVjFfMl8yMDIxLFxuICAgICAgcHJpY2VDbGFzczogY2xvdWRmcm9udC5QcmljZUNsYXNzLlBSSUNFX0NMQVNTX0FMTCxcbiAgICB9KTtcbiAgICBjb25zdCBvYWMgPSBuZXcgY2xvdWRmcm9udC5DZm5PcmlnaW5BY2Nlc3NDb250cm9sKHRoaXMsIHBhcmFtLmNsb3VkZnJvbnQub2FjTmFtZSwge1xuICAgICAgb3JpZ2luQWNjZXNzQ29udHJvbENvbmZpZzoge1xuICAgICAgICBuYW1lOiBwYXJhbS5jbG91ZGZyb250Lm9hY05hbWUsXG4gICAgICAgIG9yaWdpbkFjY2Vzc0NvbnRyb2xPcmlnaW5UeXBlOiBcInMzXCIsXG4gICAgICAgIHNpZ25pbmdCZWhhdmlvcjogXCJhbHdheXNcIixcbiAgICAgICAgc2lnbmluZ1Byb3RvY29sOiBcInNpZ3Y0XCIsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGNmbkRpc3RyaWJ1dGlvbiA9IGRpc3RyaWJ1dGlvbi5ub2RlLmRlZmF1bHRDaGlsZCBhcyBjbG91ZGZyb250LkNmbkRpc3RyaWJ1dGlvbjtcbiAgICBjZm5EaXN0cmlidXRpb24uYWRkUHJvcGVydHlPdmVycmlkZShcIkRpc3RyaWJ1dGlvbkNvbmZpZy5PcmlnaW5zLjAuUzNPcmlnaW5Db25maWcuT3JpZ2luQWNjZXNzSWRlbnRpdHlcIiwgXCJcIik7XG4gICAgY2ZuRGlzdHJpYnV0aW9uLmFkZFByb3BlcnR5T3ZlcnJpZGUoXCJEaXN0cmlidXRpb25Db25maWcuT3JpZ2lucy4wLk9yaWdpbkFjY2Vzc0NvbnRyb2xJZFwiLCBvYWMuYXR0cklkKTtcbiAgICBjb25zdCBzM0J1Y2tldFBvbGljeSA9IG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFtcInMzOkdldE9iamVjdFwiXSxcbiAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgIHByaW5jaXBhbHM6IFtuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoXCJjbG91ZGZyb250LmFtYXpvbmF3cy5jb21cIildLFxuICAgICAgcmVzb3VyY2VzOiBbYCR7czNCdWNrZXQuYnVja2V0QXJufS8qYF0sXG4gICAgfSk7XG4gICAgczNCdWNrZXRQb2xpY3kuYWRkQ29uZGl0aW9uKFwiU3RyaW5nRXF1YWxzXCIsIHtcbiAgICAgIFwiQVdTOlNvdXJjZUFyblwiOiBgYXJuOmF3czpjbG91ZGZyb250Ojoke3RoaXMuYWNjb3VudH06ZGlzdHJpYnV0aW9uLyR7ZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbklkfWAsXG4gICAgfSk7XG4gICAgczNCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShzM0J1Y2tldFBvbGljeSk7XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vLyBHaXRIdWIgLSBDb2RlUGlwZWxpbmUgICAgICAgICAgICAgICAgICAgICAgLy8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICBjb25zdCBzM0FydGlmYWN0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBwYXJhbS5waXBlbGluZS5zM05hbWUsIHtcbiAgICAgIGJ1Y2tldE5hbWU6IHBhcmFtLnBpcGVsaW5lLnMzTmFtZSxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICAgIGJ1Y2tldEtleUVuYWJsZWQ6IGZhbHNlLFxuICAgICAgbGlmZWN5Y2xlUnVsZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGV4cGlyYXRpb246IGNkay5EdXJhdGlvbi5kYXlzKDEpLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgICBjb25zdCBidWlsZE91dHB1dCA9IG5ldyBwaXBlbGluZS5BcnRpZmFjdCgpO1xuICAgIGNvbnN0IHNvdXJjZUFjdGlvbiA9IG5ldyBwaXBlbGluZWFjdGlvbnMuQ29kZVN0YXJDb25uZWN0aW9uc1NvdXJjZUFjdGlvbih7XG4gICAgICBhY3Rpb25OYW1lOiBcIkdpdEh1YlwiLFxuICAgICAgb3duZXI6IFwiRmx1cGlub2NoYW5cIixcbiAgICAgIHJlcG86IFwiTXlCbG9nVjJcIixcbiAgICAgIGJyYW5jaDogXCJtYXN0ZXJcIixcbiAgICAgIG91dHB1dDogYnVpbGRPdXRwdXQsXG4gICAgICBjb25uZWN0aW9uQXJuOiBwYXJhbS5waXBlbGluZS5jb2Rlc3RhckNvbm5lY3Rpb25Bcm4sXG4gICAgfSk7XG4gICAgY29uc3QgY29kZWJ1aWxkTG9ncyA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsIHBhcmFtLnBpcGVsaW5lLmNvZGVidWlsZExvZ3NOYW1lLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IHBhcmFtLnBpcGVsaW5lLmNvZGVidWlsZExvZ3NOYW1lLFxuICAgICAgcmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX0RBWSxcbiAgICAgIGxvZ0dyb3VwQ2xhc3M6IGxvZ3MuTG9nR3JvdXBDbGFzcy5TVEFOREFSRCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG4gICAgY29uc3QgY29kZWJ1aWxkUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGRSb2xlTmFtZSwge1xuICAgICAgcm9sZU5hbWU6IHBhcmFtLnBpcGVsaW5lLmNvZGVidWlsZFJvbGVOYW1lLFxuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoXCJjb2RlYnVpbGQuYW1hem9uYXdzLmNvbVwiKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW2lhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFXU0NvZGVCdWlsZEFkbWluQWNjZXNzXCIpXSxcbiAgICAgIGlubGluZVBvbGljaWVzOiB7XG4gICAgICAgIGlubGluZVBvbGljeTogbmV3IGlhbS5Qb2xpY3lEb2N1bWVudCh7XG4gICAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcInMzOipcIl0sXG4gICAgICAgICAgICAgIHJlc291cmNlczogW2Ake3MzQnVja2V0LmJ1Y2tldEFybn1gLCBgJHtzM0J1Y2tldC5idWNrZXRBcm59LypgXSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICAgICAgICAgIGFjdGlvbnM6IFtcImNsb3VkZnJvbnQ6KlwiXSxcbiAgICAgICAgICAgICAgcmVzb3VyY2VzOiBbYGFybjphd3M6Y2xvdWRmcm9udDo6JHt0aGlzLmFjY291bnR9OmRpc3RyaWJ1dGlvbi8ke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZH1gXSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBidWlsZEFjdGlvbiA9IG5ldyBwaXBlbGluZWFjdGlvbnMuQ29kZUJ1aWxkQWN0aW9uKHtcbiAgICAgIGFjdGlvbk5hbWU6IFwiQnVpbGRcIixcbiAgICAgIHByb2plY3Q6IG5ldyBjb2RlYnVpbGQuUGlwZWxpbmVQcm9qZWN0KHRoaXMsIHBhcmFtLnBpcGVsaW5lLmNvZGVidWlsZE5hbWUsIHtcbiAgICAgICAgcHJvamVjdE5hbWU6IHBhcmFtLnBpcGVsaW5lLmNvZGVidWlsZE5hbWUsXG4gICAgICAgIHJvbGU6IGNvZGVidWlsZFJvbGUsXG4gICAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgICAgY29tcHV0ZVR5cGU6IGNvZGVidWlsZC5Db21wdXRlVHlwZS5TTUFMTCxcbiAgICAgICAgICBidWlsZEltYWdlOiBjb2RlYnVpbGQuTGludXhCdWlsZEltYWdlLkFNQVpPTl9MSU5VWF8yXzUsXG4gICAgICAgICAgcHJpdmlsZWdlZDogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgbG9nZ2luZzoge1xuICAgICAgICAgIGNsb3VkV2F0Y2g6IHtcbiAgICAgICAgICAgIGxvZ0dyb3VwOiBjb2RlYnVpbGRMb2dzLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGJ1aWxkU3BlYzogY29kZWJ1aWxkLkJ1aWxkU3BlYy5mcm9tT2JqZWN0KHtcbiAgICAgICAgICB2ZXJzaW9uOiBcIjAuMlwiLFxuICAgICAgICAgIHBoYXNlczoge1xuICAgICAgICAgICAgYnVpbGQ6IHtcbiAgICAgICAgICAgICAgY29tbWFuZHM6IFtcImVjaG8gczMgc3luY1wiLCBcImNkIC4vcmVhY3QvYnVpbGQvXCIsIGBhd3MgczMgc3luYyAuIHMzOi8vJHtzM0J1Y2tldC5idWNrZXROYW1lfSAtLWRlbGV0ZWAsIFwiZWNobyByZW1vdmUgY2xvdWRmcm9udCBjYWNoZVwiLCBgYXdzIGNsb3VkZnJvbnQgY3JlYXRlLWludmFsaWRhdGlvbiAtLWRpc3RyaWJ1dGlvbi1pZCAke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZH0gLS1wYXRocyBcIi8qXCJgXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICB9KSxcbiAgICAgIGlucHV0OiBidWlsZE91dHB1dCxcbiAgICB9KTtcbiAgICBjb25zdCBjb2RlUGlwZWxpbmUgPSBuZXcgcGlwZWxpbmUuUGlwZWxpbmUodGhpcywgcGFyYW0ucGlwZWxpbmUucGlwZWxpbmVOYW1lLCB7XG4gICAgICBwaXBlbGluZU5hbWU6IHBhcmFtLnBpcGVsaW5lLnBpcGVsaW5lTmFtZSxcbiAgICAgIGV4ZWN1dGlvbk1vZGU6IHBpcGVsaW5lLkV4ZWN1dGlvbk1vZGUuUVVFVUVELFxuICAgICAgcGlwZWxpbmVUeXBlOiBwaXBlbGluZS5QaXBlbGluZVR5cGUuVjIsXG4gICAgICBhcnRpZmFjdEJ1Y2tldDogczNBcnRpZmFjdCxcbiAgICAgIHN0YWdlczogW1xuICAgICAgICB7XG4gICAgICAgICAgc3RhZ2VOYW1lOiBcIlNvdXJjZVwiLFxuICAgICAgICAgIGFjdGlvbnM6IFtzb3VyY2VBY3Rpb25dLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgc3RhZ2VOYW1lOiBcIkJ1aWxkXCIsXG4gICAgICAgICAgYWN0aW9uczogW2J1aWxkQWN0aW9uXSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==