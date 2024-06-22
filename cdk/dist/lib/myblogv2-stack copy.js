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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2sgY29weS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvbXlibG9ndjItc3RhY2sgY29weS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMseUNBQXlDO0FBQ3pDLHlEQUF5RDtBQUN6RCw4REFBOEQ7QUFDOUQsOERBQThEO0FBQzlELDJDQUEyQztBQUMzQyx5REFBeUQ7QUFDekQsd0VBQXdFO0FBQ3hFLHVEQUF1RDtBQUN2RCw2Q0FBNkM7QUFFN0MsNkNBQXVDO0FBRXZDLDZDQUE2QztBQUU3QyxNQUFNLEtBQUssR0FBRyxJQUFJLDBCQUFhLEVBQUUsQ0FBQztBQUVsQyxNQUFhLGFBQWMsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMxQyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLGtEQUFrRDtRQUNsRCxrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELE1BQU0sUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUU7WUFDeEQsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsVUFBVTtZQUMvQixhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLElBQUk7WUFDdkIsZ0JBQWdCLEVBQUUsS0FBSztTQUN4QixDQUFDLENBQUM7UUFDSCxxQkFBcUI7UUFDckIsbUJBQW1CO1FBQ25CLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDO1FBQ3ZELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLHFCQUFxQixFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3hH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QU8sRUFBRTtvQkFDUCxVQUFVLEVBQUU7d0JBQ1YsUUFBUSxFQUFFLGFBQWE7cUJBQ3hCO2lCQUNGO2dCQUNELFNBQVMsRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztvQkFDeEMsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsTUFBTSxFQUFFO3dCQUNOLEtBQUssRUFBRTs0QkFDTCxRQUFRLEVBQUUsQ0FBQyxjQUFjLEVBQUUsbUJBQW1CLEVBQUUsc0JBQXNCLFFBQVEsQ0FBQyxVQUFVLFdBQVcsRUFBRSw4QkFBOEIsRUFBRSx3REFBd0QsWUFBWSxDQUFDLGNBQWMsZUFBZSxDQUFDO3lCQUMxTztxQkFDRjtpQkFDRixDQUFDO2FBQ0gsQ0FBQztZQUNGLEtBQUssRUFBRSxXQUFXO1NBQ25CLENBQUMsQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUU7WUFDNUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWTtZQUN6QyxhQUFhLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQzVDLFlBQVksRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDdEMsY0FBYyxFQUFFLFVBQVU7WUFDMUIsTUFBTSxFQUFFO2dCQUNOO29CQUNFLFNBQVMsRUFBRSxRQUFRO29CQUNuQixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7aUJBQ3hCO2dCQUNEO29CQUNFLFNBQVMsRUFBRSxPQUFPO29CQUNsQixPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUM7aUJBQ3ZCO2FBQ0Y7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFqS0Qsc0NBaUtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgczMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1zM1wiO1xuaW1wb3J0ICogYXMgY2xvdWRmcm9udCBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnRcIjtcbmltcG9ydCAqIGFzIG9yaWdpbnMgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jbG91ZGZyb250LW9yaWdpbnNcIjtcbmltcG9ydCAqIGFzIGNlcnRtZ3IgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXJcIjtcbmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xuaW1wb3J0ICogYXMgcGlwZWxpbmUgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jb2RlcGlwZWxpbmVcIjtcbmltcG9ydCAqIGFzIHBpcGVsaW5lYWN0aW9ucyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNvZGVwaXBlbGluZS1hY3Rpb25zXCI7XG5pbXBvcnQgKiBhcyBjb2RlYnVpbGQgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jb2RlYnVpbGRcIjtcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sb2dzXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcblxuaW1wb3J0IHsgTXlCbG9nUGFyYW1WMiB9IGZyb20gXCIuL3BhcmFtZXRlcnNcIjtcblxuY29uc3QgcGFyYW0gPSBuZXcgTXlCbG9nUGFyYW1WMigpO1xuXG5leHBvcnQgY2xhc3MgTXlibG9ndjJTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8vIFMzLCBDbG91ZEZyb250ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIGNvbnN0IHMzQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBwYXJhbS5zMy5idWNrZXROYW1lLCB7XG4gICAgICBidWNrZXROYW1lOiBwYXJhbS5zMy5idWNrZXROYW1lLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcbiAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlLFxuICAgICAgYnVja2V0S2V5RW5hYmxlZDogZmFsc2UsXG4gICAgfSk7XG4gICAgLy8g6Ki85piO5pu444Gv44CBUlNBIDIwNDjjgavjgZnjgovjgZPjgahcbiAgICAvLyDjg6rjg7zjgrjjg6fjg7Pjga/jgIF1cy1lYXN0LTFcbiAgICBjb25zdCBjZXJ0aWZpY2F0ZUFybiA9IHBhcmFtLmNsb3VkZnJvbnQuY2VydGlmaWNhdGVBcm47XG4gICAgY29uc3QgY2VydGlmaWNhdGUgPSBjZXJ0bWdyLkNlcnRpZmljYXRlLmZyb21DZXJ0aWZpY2F0ZUFybih0aGlzLCBcIk15QmxvZ1YyQ2VydGlmaWNhdGVcIiwgY2VydGlmaWNhdGVBcm4pO1xuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCBcImNsb3VkZnJvbnRcIiwge1xuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4oczNCdWNrZXQpLFxuICAgICAgICBjb21wcmVzczogdHJ1ZSxcbiAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgIGFsbG93ZWRNZXRob2RzOiBjbG91ZGZyb250LkFsbG93ZWRNZXRob2RzLkFMTE9XX0dFVF9IRUFEX09QVElPTlMsXG4gICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfT1BUSU1JWkVELFxuICAgICAgfSxcbiAgICAgIGNlcnRpZmljYXRlOiBjZXJ0aWZpY2F0ZSxcbiAgICAgIGRlZmF1bHRSb290T2JqZWN0OiBcImluZGV4Lmh0bWxcIixcbiAgICAgIGRvbWFpbk5hbWVzOiBbXCJkZXYubWV0YWxtZW50YWwubmV0XCJdLFxuICAgICAgZXJyb3JSZXNwb25zZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGh0dHBTdGF0dXM6IDQwMyxcbiAgICAgICAgICB0dGw6IER1cmF0aW9uLnNlY29uZHMoNSksXG4gICAgICAgICAgcmVzcG9uc2VIdHRwU3RhdHVzOiAyMDAsXG4gICAgICAgICAgcmVzcG9uc2VQYWdlUGF0aDogXCIvaW5kZXguaHRtbFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaHR0cFN0YXR1czogNDA0LFxuICAgICAgICAgIHR0bDogRHVyYXRpb24uc2Vjb25kcyg1KSxcbiAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiBcIi9pbmRleC5odG1sXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgaHR0cFZlcnNpb246IGNsb3VkZnJvbnQuSHR0cFZlcnNpb24uSFRUUDJfQU5EXzMsXG4gICAgICBtaW5pbXVtUHJvdG9jb2xWZXJzaW9uOiBjbG91ZGZyb250LlNlY3VyaXR5UG9saWN5UHJvdG9jb2wuVExTX1YxXzJfMjAyMSxcbiAgICAgIHByaWNlQ2xhc3M6IGNsb3VkZnJvbnQuUHJpY2VDbGFzcy5QUklDRV9DTEFTU19BTEwsXG4gICAgfSk7XG4gICAgY29uc3Qgb2FjID0gbmV3IGNsb3VkZnJvbnQuQ2ZuT3JpZ2luQWNjZXNzQ29udHJvbCh0aGlzLCBwYXJhbS5jbG91ZGZyb250Lm9hY05hbWUsIHtcbiAgICAgIG9yaWdpbkFjY2Vzc0NvbnRyb2xDb25maWc6IHtcbiAgICAgICAgbmFtZTogcGFyYW0uY2xvdWRmcm9udC5vYWNOYW1lLFxuICAgICAgICBvcmlnaW5BY2Nlc3NDb250cm9sT3JpZ2luVHlwZTogXCJzM1wiLFxuICAgICAgICBzaWduaW5nQmVoYXZpb3I6IFwiYWx3YXlzXCIsXG4gICAgICAgIHNpZ25pbmdQcm90b2NvbDogXCJzaWd2NFwiLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCBjZm5EaXN0cmlidXRpb24gPSBkaXN0cmlidXRpb24ubm9kZS5kZWZhdWx0Q2hpbGQgYXMgY2xvdWRmcm9udC5DZm5EaXN0cmlidXRpb247XG4gICAgY2ZuRGlzdHJpYnV0aW9uLmFkZFByb3BlcnR5T3ZlcnJpZGUoXCJEaXN0cmlidXRpb25Db25maWcuT3JpZ2lucy4wLlMzT3JpZ2luQ29uZmlnLk9yaWdpbkFjY2Vzc0lkZW50aXR5XCIsIFwiXCIpO1xuICAgIGNmbkRpc3RyaWJ1dGlvbi5hZGRQcm9wZXJ0eU92ZXJyaWRlKFwiRGlzdHJpYnV0aW9uQ29uZmlnLk9yaWdpbnMuMC5PcmlnaW5BY2Nlc3NDb250cm9sSWRcIiwgb2FjLmF0dHJJZCk7XG4gICAgY29uc3QgczNCdWNrZXRQb2xpY3kgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBhY3Rpb25zOiBbXCJzMzpHZXRPYmplY3RcIl0sXG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBwcmluY2lwYWxzOiBbbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwiY2xvdWRmcm9udC5hbWF6b25hd3MuY29tXCIpXSxcbiAgICAgIHJlc291cmNlczogW2Ake3MzQnVja2V0LmJ1Y2tldEFybn0vKmBdLFxuICAgIH0pO1xuICAgIHMzQnVja2V0UG9saWN5LmFkZENvbmRpdGlvbihcIlN0cmluZ0VxdWFsc1wiLCB7XG4gICAgICBcIkFXUzpTb3VyY2VBcm5cIjogYGFybjphd3M6Y2xvdWRmcm9udDo6JHt0aGlzLmFjY291bnR9OmRpc3RyaWJ1dGlvbi8ke2Rpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25JZH1gLFxuICAgIH0pO1xuICAgIHMzQnVja2V0LmFkZFRvUmVzb3VyY2VQb2xpY3koczNCdWNrZXRQb2xpY3kpO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLy8gR2l0SHViIC0gQ29kZVBpcGVsaW5lICAgICAgICAgICAgICAgICAgICAgIC8vL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgY29uc3QgczNBcnRpZmFjdCA9IG5ldyBzMy5CdWNrZXQodGhpcywgcGFyYW0ucGlwZWxpbmUuczNOYW1lLCB7XG4gICAgICBidWNrZXROYW1lOiBwYXJhbS5waXBlbGluZS5zM05hbWUsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IHRydWUsXG4gICAgICBidWNrZXRLZXlFbmFibGVkOiBmYWxzZSxcbiAgICAgIGxpZmVjeWNsZVJ1bGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBleHBpcmF0aW9uOiBjZGsuRHVyYXRpb24uZGF5cygxKSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gICAgY29uc3QgYnVpbGRPdXRwdXQgPSBuZXcgcGlwZWxpbmUuQXJ0aWZhY3QoKTtcbiAgICBjb25zdCBzb3VyY2VBY3Rpb24gPSBuZXcgcGlwZWxpbmVhY3Rpb25zLkNvZGVTdGFyQ29ubmVjdGlvbnNTb3VyY2VBY3Rpb24oe1xuICAgICAgYWN0aW9uTmFtZTogXCJHaXRIdWJcIixcbiAgICAgIG93bmVyOiBcIkZsdXBpbm9jaGFuXCIsXG4gICAgICByZXBvOiBcIk15QmxvZ1YyXCIsXG4gICAgICBicmFuY2g6IFwibWFzdGVyXCIsXG4gICAgICBvdXRwdXQ6IGJ1aWxkT3V0cHV0LFxuICAgICAgY29ubmVjdGlvbkFybjogcGFyYW0ucGlwZWxpbmUuY29kZXN0YXJDb25uZWN0aW9uQXJuLFxuICAgIH0pO1xuICAgIGNvbnN0IGNvZGVidWlsZExvZ3MgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGRMb2dzTmFtZSwge1xuICAgICAgbG9nR3JvdXBOYW1lOiBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGRMb2dzTmFtZSxcbiAgICAgIHJldGVudGlvbjogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9EQVksXG4gICAgICBsb2dHcm91cENsYXNzOiBsb2dzLkxvZ0dyb3VwQ2xhc3MuU1RBTkRBUkQsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuICAgIGNvbnN0IGNvZGVidWlsZFJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgcGFyYW0ucGlwZWxpbmUuY29kZWJ1aWxkUm9sZU5hbWUsIHtcbiAgICAgIHJvbGVOYW1lOiBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGRSb2xlTmFtZSxcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKFwiY29kZWJ1aWxkLmFtYXpvbmF3cy5jb21cIiksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NDb2RlQnVpbGRBZG1pbkFjY2Vzc1wiKV0sXG4gICAgICBpbmxpbmVQb2xpY2llczoge1xuICAgICAgICBpbmxpbmVQb2xpY3k6IG5ldyBpYW0uUG9saWN5RG9jdW1lbnQoe1xuICAgICAgICAgIHN0YXRlbWVudHM6IFtcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXCJzMzoqXCJdLFxuICAgICAgICAgICAgICByZXNvdXJjZXM6IFtgJHtzM0J1Y2tldC5idWNrZXRBcm59YCwgYCR7czNCdWNrZXQuYnVja2V0QXJufS8qYF0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgICAgICAgICBhY3Rpb25zOiBbXCJjbG91ZGZyb250OipcIl0sXG4gICAgICAgICAgICAgIHJlc291cmNlczogW2Bhcm46YXdzOmNsb3VkZnJvbnQ6OiR7dGhpcy5hY2NvdW50fTpkaXN0cmlidXRpb24vJHtkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWR9YF0sXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgYnVpbGRBY3Rpb24gPSBuZXcgcGlwZWxpbmVhY3Rpb25zLkNvZGVCdWlsZEFjdGlvbih7XG4gICAgICBhY3Rpb25OYW1lOiBcIkJ1aWxkXCIsXG4gICAgICBwcm9qZWN0OiBuZXcgY29kZWJ1aWxkLlBpcGVsaW5lUHJvamVjdCh0aGlzLCBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGROYW1lLCB7XG4gICAgICAgIHByb2plY3ROYW1lOiBwYXJhbS5waXBlbGluZS5jb2RlYnVpbGROYW1lLFxuICAgICAgICByb2xlOiBjb2RlYnVpbGRSb2xlLFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIGNvbXB1dGVUeXBlOiBjb2RlYnVpbGQuQ29tcHV0ZVR5cGUuU01BTEwsXG4gICAgICAgICAgYnVpbGRJbWFnZTogY29kZWJ1aWxkLkxpbnV4QnVpbGRJbWFnZS5BTUFaT05fTElOVVhfMl81LFxuICAgICAgICAgIHByaXZpbGVnZWQ6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGxvZ2dpbmc6IHtcbiAgICAgICAgICBjbG91ZFdhdGNoOiB7XG4gICAgICAgICAgICBsb2dHcm91cDogY29kZWJ1aWxkTG9ncyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBidWlsZFNwZWM6IGNvZGVidWlsZC5CdWlsZFNwZWMuZnJvbU9iamVjdCh7XG4gICAgICAgICAgdmVyc2lvbjogXCIwLjJcIixcbiAgICAgICAgICBwaGFzZXM6IHtcbiAgICAgICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgICAgIGNvbW1hbmRzOiBbXCJlY2hvIHMzIHN5bmNcIiwgXCJjZCAuL3JlYWN0L2J1aWxkL1wiLCBgYXdzIHMzIHN5bmMgLiBzMzovLyR7czNCdWNrZXQuYnVja2V0TmFtZX0gLS1kZWxldGVgLCBcImVjaG8gcmVtb3ZlIGNsb3VkZnJvbnQgY2FjaGVcIiwgYGF3cyBjbG91ZGZyb250IGNyZWF0ZS1pbnZhbGlkYXRpb24gLS1kaXN0cmlidXRpb24taWQgJHtkaXN0cmlidXRpb24uZGlzdHJpYnV0aW9uSWR9IC0tcGF0aHMgXCIvKlwiYF0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pLFxuICAgICAgfSksXG4gICAgICBpbnB1dDogYnVpbGRPdXRwdXQsXG4gICAgfSk7XG4gICAgY29uc3QgY29kZVBpcGVsaW5lID0gbmV3IHBpcGVsaW5lLlBpcGVsaW5lKHRoaXMsIHBhcmFtLnBpcGVsaW5lLnBpcGVsaW5lTmFtZSwge1xuICAgICAgcGlwZWxpbmVOYW1lOiBwYXJhbS5waXBlbGluZS5waXBlbGluZU5hbWUsXG4gICAgICBleGVjdXRpb25Nb2RlOiBwaXBlbGluZS5FeGVjdXRpb25Nb2RlLlFVRVVFRCxcbiAgICAgIHBpcGVsaW5lVHlwZTogcGlwZWxpbmUuUGlwZWxpbmVUeXBlLlYyLFxuICAgICAgYXJ0aWZhY3RCdWNrZXQ6IHMzQXJ0aWZhY3QsXG4gICAgICBzdGFnZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHN0YWdlTmFtZTogXCJTb3VyY2VcIixcbiAgICAgICAgICBhY3Rpb25zOiBbc291cmNlQWN0aW9uXSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHN0YWdlTmFtZTogXCJCdWlsZFwiLFxuICAgICAgICAgIGFjdGlvbnM6IFtidWlsZEFjdGlvbl0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG59XG4iXX0=