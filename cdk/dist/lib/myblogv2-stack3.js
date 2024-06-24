"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Myblogv2Stack3 = void 0;
const cdk = require("aws-cdk-lib");
const iam = require("aws-cdk-lib/aws-iam");
const cognito = require("aws-cdk-lib/aws-cognito");
const certmgr = require("aws-cdk-lib/aws-certificatemanager");
const iot = require("aws-cdk-lib/aws-iot");
const parameters3_1 = require("./parameters3");
const param = new parameters3_1.MyBlogParam3V2();
class Myblogv2Stack3 extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //////////////////////////////////////////////////
        /// Cognito                                    ///
        //////////////////////////////////////////////////
        ////////////////
        /// UserPool ///
        ////////////////
        const cognitoUserPool = new cognito.UserPool(this, param.cognito.userPoolName, {
            userPoolName: param.cognito.userPoolName,
            accountRecovery: cognito.AccountRecovery.EMAIL_AND_PHONE_WITHOUT_MFA,
            autoVerify: {
                email: true,
            },
            selfSignUpEnabled: true,
            signInAliases: {
                username: false,
                email: true,
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
            },
            userVerification: {
                emailStyle: cognito.VerificationEmailStyle.CODE, // CODE or LINK
                emailSubject: "Verify your email for MetalMental Blog!",
                emailBody: "Thanks for signing up to MetalMental Blog! Your verification code is {####}",
                smsMessage: "Thanks for signing up to MetalMental Blog! Your verification code is {####}",
            },
            email: cognito.UserPoolEmail.withSES({
                sesRegion: "us-west-2",
                fromName: "MetalMental Blog",
                fromEmail: "flupino@metalmental.net",
            }),
            signInCaseSensitive: false,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // サブドメインであること? 親ドメインにはAレコードを127.0.0.1で良いので設定しておくこと
        // ACMのリージョンはバージニアのみ
        const certificateArn = param.cognito.certificateArn;
        const certificate = certmgr.Certificate.fromCertificateArn(this, "CognitoCertificate", certificateArn);
        cognitoUserPool.addDomain("CustomDomain", {
            customDomain: {
                domainName: "dev.auth.metalmental.net",
                certificate: certificate,
            },
        });
        const userPoolClient = cognitoUserPool.addClient(param.cognito.userPoolClientName, {
            userPoolClientName: param.cognito.userPoolClientName,
            authFlows: {
                userSrp: true,
            },
            generateSecret: false,
            preventUserExistenceErrors: true,
            supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO],
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                },
                scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
                callbackUrls: ["https://dev.metalmental.net/"],
                logoutUrls: ["https://dev.auth.metalmental.net/"],
            },
        });
        /////////////////////
        /// Identity Pool ///
        /////////////////////
        const cognitoIdentityPool = new cognito.CfnIdentityPool(this, param.cognito.identityPoolName, {
            identityPoolName: param.cognito.identityPoolName,
            allowUnauthenticatedIdentities: false,
            cognitoIdentityProviders: [
                {
                    clientId: userPoolClient.userPoolClientId,
                    providerName: cognitoUserPool.userPoolProviderName,
                },
            ],
        });
        const cognitoRole = new iam.Role(this, param.cognito.roleName, {
            roleName: param.cognito.roleName,
            assumedBy: new iam.FederatedPrincipal("cognito-identity.amazonaws.com", {
                StringEquals: {
                    "cognito-identity.amazonaws.com:aud": cognitoIdentityPool.ref,
                },
                "ForAnyValue:StringLike": {
                    "cognito-identity.amazonaws.com:amr": "authenticated",
                },
            }, "sts:AssumeRoleWithWebIdentity"),
            managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName("AWSIoTFullAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AWSIoTDataAccess"), iam.ManagedPolicy.fromAwsManagedPolicyName("AWSIoTConfigAccess")],
        });
        const cfnIdentityPoolRoleAttachment = new cognito.CfnIdentityPoolRoleAttachment(this, "cfnIdentityPoolRoleAttachment", {
            identityPoolId: cognitoIdentityPool.ref,
            roles: {
                authenticated: cognitoRole.roleArn,
            },
        });
        //////////////////
        /// IoT Policy ///
        //////////////////
        const iotPolicy = new iot.CfnPolicy(this, param.iot.policyName, {
            policyName: param.iot.policyName,
            policyDocument: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Action: ["iot:*"],
                        Resource: "*",
                    },
                ],
            },
        });
        const iotPolicyPrincipalAttachment = new iot.CfnPolicyPrincipalAttachment(this, "iotPolicyPrincipalAttachment", {
            policyName: iotPolicy.policyName,
            principal: param.cognito.userIdentityId,
        });
        iotPolicyPrincipalAttachment.node.addDependency(iotPolicy);
    }
}
exports.Myblogv2Stack3 = Myblogv2Stack3;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2szLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9teWJsb2d2Mi1zdGFjazMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUkzQyxtREFBbUQ7QUFDbkQsOERBQThEO0FBQzlELDJDQUEyQztBQU0zQywrQ0FBK0M7QUFFL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSw0QkFBYyxFQUFFLENBQUM7QUFFbkMsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFHM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QixrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxnQkFBZ0I7UUFDaEIsZ0JBQWdCO1FBQ2hCLGdCQUFnQjtRQUNoQixNQUFNLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFO1lBQzdFLFlBQVksRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVk7WUFDeEMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsMkJBQTJCO1lBQ3BFLFVBQVUsRUFBRTtnQkFDVixLQUFLLEVBQUUsSUFBSTthQUNaO1lBQ0QsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixhQUFhLEVBQUU7Z0JBQ2IsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsS0FBSyxFQUFFLElBQUk7YUFDWjtZQUNELGtCQUFrQixFQUFFO2dCQUNsQixLQUFLLEVBQUU7b0JBQ0wsUUFBUSxFQUFFLElBQUk7b0JBQ2QsT0FBTyxFQUFFLElBQUk7aUJBQ2Q7YUFDRjtZQUNELGdCQUFnQixFQUFFO2dCQUNoQixVQUFVLEVBQUUsT0FBTyxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFB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aWJcIjtcclxuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XHJcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sb2dzXCI7XHJcbmltcG9ydCAqIGFzIGFwaWd3IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheVwiO1xyXG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSBcImF3cy1jZGstbGliL2F3cy1sYW1iZGFcIjtcclxuaW1wb3J0ICogYXMgY29nbml0byBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNvZ25pdG9cIjtcclxuaW1wb3J0ICogYXMgY2VydG1nciBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWNlcnRpZmljYXRlbWFuYWdlclwiO1xyXG5pbXBvcnQgKiBhcyBpb3QgZnJvbSBcImF3cy1jZGstbGliL2F3cy1pb3RcIjtcclxuXHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcclxuaW1wb3J0IHsgRHVyYXRpb24gfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcclxuXHJcbmltcG9ydCB7IE15QmxvZ1BhcmFtM1YyIH0gZnJvbSBcIi4vcGFyYW1ldGVyczNcIjtcclxuXHJcbmNvbnN0IHBhcmFtID0gbmV3IE15QmxvZ1BhcmFtM1YyKCk7XHJcblxyXG5leHBvcnQgY2xhc3MgTXlibG9ndjJTdGFjazMgZXh0ZW5kcyBjZGsuU3RhY2sge1xyXG4gIHB1YmxpYyByZWFkb25seSBhcGk6IGFwaWd3LkxhbWJkYVJlc3RBcGk7XHJcblxyXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcclxuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vLyBDb2duaXRvICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8vXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8vIFVzZXJQb29sIC8vL1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY29uc3QgY29nbml0b1VzZXJQb29sID0gbmV3IGNvZ25pdG8uVXNlclBvb2wodGhpcywgcGFyYW0uY29nbml0by51c2VyUG9vbE5hbWUsIHtcclxuICAgICAgdXNlclBvb2xOYW1lOiBwYXJhbS5jb2duaXRvLnVzZXJQb29sTmFtZSxcclxuICAgICAgYWNjb3VudFJlY292ZXJ5OiBjb2duaXRvLkFjY291bnRSZWNvdmVyeS5FTUFJTF9BTkRfUEhPTkVfV0lUSE9VVF9NRkEsXHJcbiAgICAgIGF1dG9WZXJpZnk6IHtcclxuICAgICAgICBlbWFpbDogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgc2VsZlNpZ25VcEVuYWJsZWQ6IHRydWUsXHJcbiAgICAgIHNpZ25JbkFsaWFzZXM6IHtcclxuICAgICAgICB1c2VybmFtZTogZmFsc2UsXHJcbiAgICAgICAgZW1haWw6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHN0YW5kYXJkQXR0cmlidXRlczoge1xyXG4gICAgICAgIGVtYWlsOiB7XHJcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICAgIG11dGFibGU6IHRydWUsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgICAgdXNlclZlcmlmaWNhdGlvbjoge1xyXG4gICAgICAgIGVtYWlsU3R5bGU6IGNvZ25pdG8uVmVyaWZpY2F0aW9uRW1haWxTdHlsZS5DT0RFLCAvLyBDT0RFIG9yIExJTktcclxuICAgICAgICBlbWFpbFN1YmplY3Q6IFwiVmVyaWZ5IHlvdXIgZW1haWwgZm9yIE1ldGFsTWVudGFsIEJsb2chXCIsXHJcbiAgICAgICAgZW1haWxCb2R5OiBcIlRoYW5rcyBmb3Igc2lnbmluZyB1cCB0byBNZXRhbE1lbnRhbCBCbG9nISBZb3VyIHZlcmlmaWNhdGlvbiBjb2RlIGlzIHsjIyMjfVwiLFxyXG4gICAgICAgIHNtc01lc3NhZ2U6IFwiVGhhbmtzIGZvciBzaWduaW5nIHVwIHRvIE1ldGFsTWVudGFsIEJsb2chIFlvdXIgdmVyaWZpY2F0aW9uIGNvZGUgaXMgeyMjIyN9XCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIGVtYWlsOiBjb2duaXRvLlVzZXJQb29sRW1haWwud2l0aFNFUyh7XHJcbiAgICAgICAgc2VzUmVnaW9uOiBcInVzLXdlc3QtMlwiLFxyXG4gICAgICAgIGZyb21OYW1lOiBcIk1ldGFsTWVudGFsIEJsb2dcIixcclxuICAgICAgICBmcm9tRW1haWw6IFwiZmx1cGlub0BtZXRhbG1lbnRhbC5uZXRcIixcclxuICAgICAgfSksXHJcbiAgICAgIHNpZ25JbkNhc2VTZW5zaXRpdmU6IGZhbHNlLFxyXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxyXG4gICAgfSk7XHJcbiAgICAvLyDjgrXjg5bjg4njg6HjgqTjg7PjgafjgYLjgovjgZPjgag/IOimquODieODoeOCpOODs+OBq+OBr0Hjg6zjgrPjg7zjg4njgpIxMjcuMC4wLjHjgafoia/jgYTjga7jgafoqK3lrprjgZfjgabjgYrjgY/jgZPjgahcclxuICAgIC8vIEFDTeOBruODquODvOOCuOODp+ODs+OBr+ODkOODvOOCuOODi+OCouOBruOBv1xyXG4gICAgY29uc3QgY2VydGlmaWNhdGVBcm4gPSBwYXJhbS5jb2duaXRvLmNlcnRpZmljYXRlQXJuO1xyXG4gICAgY29uc3QgY2VydGlmaWNhdGUgPSBjZXJ0bWdyLkNlcnRpZmljYXRlLmZyb21DZXJ0aWZpY2F0ZUFybih0aGlzLCBcIkNvZ25pdG9DZXJ0aWZpY2F0ZVwiLCBjZXJ0aWZpY2F0ZUFybik7XHJcbiAgICBjb2duaXRvVXNlclBvb2wuYWRkRG9tYWluKFwiQ3VzdG9tRG9tYWluXCIsIHtcclxuICAgICAgY3VzdG9tRG9tYWluOiB7XHJcbiAgICAgICAgZG9tYWluTmFtZTogXCJkZXYuYXV0aC5tZXRhbG1lbnRhbC5uZXRcIixcclxuICAgICAgICBjZXJ0aWZpY2F0ZTogY2VydGlmaWNhdGUsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IHVzZXJQb29sQ2xpZW50ID0gY29nbml0b1VzZXJQb29sLmFkZENsaWVudChwYXJhbS5jb2duaXRvLnVzZXJQb29sQ2xpZW50TmFtZSwge1xyXG4gICAgICB1c2VyUG9vbENsaWVudE5hbWU6IHBhcmFtLmNvZ25pdG8udXNlclBvb2xDbGllbnROYW1lLFxyXG4gICAgICBhdXRoRmxvd3M6IHtcclxuICAgICAgICB1c2VyU3JwOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgICBnZW5lcmF0ZVNlY3JldDogZmFsc2UsXHJcbiAgICAgIHByZXZlbnRVc2VyRXhpc3RlbmNlRXJyb3JzOiB0cnVlLFxyXG4gICAgICBzdXBwb3J0ZWRJZGVudGl0eVByb3ZpZGVyczogW2NvZ25pdG8uVXNlclBvb2xDbGllbnRJZGVudGl0eVByb3ZpZGVyLkNPR05JVE9dLFxyXG4gICAgICBvQXV0aDoge1xyXG4gICAgICAgIGZsb3dzOiB7XHJcbiAgICAgICAgICBhdXRob3JpemF0aW9uQ29kZUdyYW50OiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2NvcGVzOiBbY29nbml0by5PQXV0aFNjb3BlLk9QRU5JRCwgY29nbml0by5PQXV0aFNjb3BlLkVNQUlMLCBjb2duaXRvLk9BdXRoU2NvcGUuUFJPRklMRV0sXHJcbiAgICAgICAgY2FsbGJhY2tVcmxzOiBbXCJodHRwczovL2Rldi5tZXRhbG1lbnRhbC5uZXQvXCJdLFxyXG4gICAgICAgIGxvZ291dFVybHM6IFtcImh0dHBzOi8vZGV2LmF1dGgubWV0YWxtZW50YWwubmV0L1wiXSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAvLy8gSWRlbnRpdHkgUG9vbCAvLy9cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY29uc3QgY29nbml0b0lkZW50aXR5UG9vbCA9IG5ldyBjb2duaXRvLkNmbklkZW50aXR5UG9vbCh0aGlzLCBwYXJhbS5jb2duaXRvLmlkZW50aXR5UG9vbE5hbWUsIHtcclxuICAgICAgaWRlbnRpdHlQb29sTmFtZTogcGFyYW0uY29nbml0by5pZGVudGl0eVBvb2xOYW1lLFxyXG4gICAgICBhbGxvd1VuYXV0aGVudGljYXRlZElkZW50aXRpZXM6IGZhbHNlLFxyXG4gICAgICBjb2duaXRvSWRlbnRpdHlQcm92aWRlcnM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBjbGllbnRJZDogdXNlclBvb2xDbGllbnQudXNlclBvb2xDbGllbnRJZCxcclxuICAgICAgICAgIHByb3ZpZGVyTmFtZTogY29nbml0b1VzZXJQb29sLnVzZXJQb29sUHJvdmlkZXJOYW1lLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIF0sXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGNvZ25pdG9Sb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsIHBhcmFtLmNvZ25pdG8ucm9sZU5hbWUsIHtcclxuICAgICAgcm9sZU5hbWU6IHBhcmFtLmNvZ25pdG8ucm9sZU5hbWUsXHJcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5GZWRlcmF0ZWRQcmluY2lwYWwoXHJcbiAgICAgICAgXCJjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb21cIixcclxuICAgICAgICB7XHJcbiAgICAgICAgICBTdHJpbmdFcXVhbHM6IHtcclxuICAgICAgICAgICAgXCJjb2duaXRvLWlkZW50aXR5LmFtYXpvbmF3cy5jb206YXVkXCI6IGNvZ25pdG9JZGVudGl0eVBvb2wucmVmLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIFwiRm9yQW55VmFsdWU6U3RyaW5nTGlrZVwiOiB7XHJcbiAgICAgICAgICAgIFwiY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmFtclwiOiBcImF1dGhlbnRpY2F0ZWRcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInN0czpBc3N1bWVSb2xlV2l0aFdlYklkZW50aXR5XCIsXHJcbiAgICAgICksXHJcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW2lhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFXU0lvVEZ1bGxBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFXU0lvVERhdGFBY2Nlc3NcIiksIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcIkFXU0lvVENvbmZpZ0FjY2Vzc1wiKV0sXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGNmbklkZW50aXR5UG9vbFJvbGVBdHRhY2htZW50ID0gbmV3IGNvZ25pdG8uQ2ZuSWRlbnRpdHlQb29sUm9sZUF0dGFjaG1lbnQodGhpcywgXCJjZm5JZGVudGl0eVBvb2xSb2xlQXR0YWNobWVudFwiLCB7XHJcbiAgICAgIGlkZW50aXR5UG9vbElkOiBjb2duaXRvSWRlbnRpdHlQb29sLnJlZixcclxuICAgICAgcm9sZXM6IHtcclxuICAgICAgICBhdXRoZW50aWNhdGVkOiBjb2duaXRvUm9sZS5yb2xlQXJuLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vLyBJb1QgUG9saWN5IC8vL1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICBjb25zdCBpb3RQb2xpY3kgPSBuZXcgaW90LkNmblBvbGljeSh0aGlzLCBwYXJhbS5pb3QucG9saWN5TmFtZSwge1xyXG4gICAgICBwb2xpY3lOYW1lOiBwYXJhbS5pb3QucG9saWN5TmFtZSxcclxuICAgICAgcG9saWN5RG9jdW1lbnQ6IHtcclxuICAgICAgICBWZXJzaW9uOiBcIjIwMTItMTAtMTdcIixcclxuICAgICAgICBTdGF0ZW1lbnQ6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgRWZmZWN0OiBcIkFsbG93XCIsXHJcbiAgICAgICAgICAgIEFjdGlvbjogW1wiaW90OipcIl0sXHJcbiAgICAgICAgICAgIFJlc291cmNlOiBcIipcIixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgY29uc3QgaW90UG9saWN5UHJpbmNpcGFsQXR0YWNobWVudCA9IG5ldyBpb3QuQ2ZuUG9saWN5UHJpbmNpcGFsQXR0YWNobWVudCh0aGlzLCBcImlvdFBvbGljeVByaW5jaXBhbEF0dGFjaG1lbnRcIiwge1xyXG4gICAgICBwb2xpY3lOYW1lOiBpb3RQb2xpY3kucG9saWN5TmFtZSBhcyBzdHJpbmcsXHJcbiAgICAgIHByaW5jaXBhbDogcGFyYW0uY29nbml0by51c2VySWRlbnRpdHlJZCxcclxuICAgIH0pO1xyXG4gICAgaW90UG9saWN5UHJpbmNpcGFsQXR0YWNobWVudC5ub2RlLmFkZERlcGVuZGVuY3koaW90UG9saWN5KTtcclxuICB9XHJcbn1cclxuIl19