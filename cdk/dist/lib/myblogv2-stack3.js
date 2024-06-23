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
            principal: cognitoIdentityPool.ref,
        });
        iotPolicyPrincipalAttachment.node.addDependency(iotPolicy);
    }
}
exports.Myblogv2Stack3 = Myblogv2Stack3;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlibG9ndjItc3RhY2szLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9teWJsb2d2Mi1zdGFjazMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUkzQyxtREFBbUQ7QUFDbkQsOERBQThEO0FBQzlELDJDQUEyQztBQU0zQywrQ0FBK0M7QUFFL0MsTUFBTSxLQUFLLEdBQUcsSUFBSSw0QkFBYyxFQUFFLENBQUM7QUFFbkMsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFHM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QixrREFBa0Q7UUFDbEQsa0RBQWtEO1FBQ2xELGtEQUFrRDtRQUNsRCxnQkFBZ0I7UUFDaEIsZ0JBQWdCO1FBQ2hCLGdCQUFnQjtRQUNoQixNQUFNLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFO1lBQzdFLFlBQVksRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVk7WUFDeEMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsMkJBQTJCO1lBQ3BFLFVBQVUsRUFBRTtnQkFDVixLQUFLLEVBQUUsSUFBSTthQUNaO1lBQ0QsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixhQUFhLEVBQUU7Z0JBQ2IsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsS0FBSyxFQUFFLElBQUk7YUFDWjtZQUNELGtCQUFrQixFQUFFO2dCQUNsQixLQUFLLEVBQUU7b0JBQ0wsUUFBUSxFQUFFLElBQUk7b0JBQ2QsT0FBTyxFQUFFLElBQUk7aUJBQ2Q7YUFDRjtZQUNELGdCQUFnQixFQUFFO2dCQUNoQixVQUFVLEVBQUUsT0FBTyxDQUFDLHNCQUFzQixDQUFDLElBQUksRUFB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bmltcG9ydCAqIGFzIGlhbSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWlhbVwiO1xyXG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbG9nc1wiO1xyXG5pbXBvcnQgKiBhcyBhcGlndyBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXlcIjtcclxuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtbGFtYmRhXCI7XHJcbmltcG9ydCAqIGFzIGNvZ25pdG8gZnJvbSBcImF3cy1jZGstbGliL2F3cy1jb2duaXRvXCI7XHJcbmltcG9ydCAqIGFzIGNlcnRtZ3IgZnJvbSBcImF3cy1jZGstbGliL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXJcIjtcclxuaW1wb3J0ICogYXMgaW90IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaW90XCI7XHJcblxyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gXCJjb25zdHJ1Y3RzXCI7XHJcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSBcImF3cy1jZGstbGliXCI7XHJcblxyXG5pbXBvcnQgeyBNeUJsb2dQYXJhbTNWMiB9IGZyb20gXCIuL3BhcmFtZXRlcnMzXCI7XHJcblxyXG5jb25zdCBwYXJhbSA9IG5ldyBNeUJsb2dQYXJhbTNWMigpO1xyXG5cclxuZXhwb3J0IGNsYXNzIE15YmxvZ3YyU3RhY2szIGV4dGVuZHMgY2RrLlN0YWNrIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgYXBpOiBhcGlndy5MYW1iZGFSZXN0QXBpO1xyXG5cclxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XHJcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAvLy8gQ29nbml0byAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vL1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vLy8vLy8vLy8vLy8vLy9cclxuICAgIC8vLyBVc2VyUG9vbCAvLy9cclxuICAgIC8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNvbnN0IGNvZ25pdG9Vc2VyUG9vbCA9IG5ldyBjb2duaXRvLlVzZXJQb29sKHRoaXMsIHBhcmFtLmNvZ25pdG8udXNlclBvb2xOYW1lLCB7XHJcbiAgICAgIHVzZXJQb29sTmFtZTogcGFyYW0uY29nbml0by51c2VyUG9vbE5hbWUsXHJcbiAgICAgIGFjY291bnRSZWNvdmVyeTogY29nbml0by5BY2NvdW50UmVjb3ZlcnkuRU1BSUxfQU5EX1BIT05FX1dJVEhPVVRfTUZBLFxyXG4gICAgICBhdXRvVmVyaWZ5OiB7XHJcbiAgICAgICAgZW1haWw6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHNlbGZTaWduVXBFbmFibGVkOiB0cnVlLFxyXG4gICAgICBzaWduSW5BbGlhc2VzOiB7XHJcbiAgICAgICAgdXNlcm5hbWU6IGZhbHNlLFxyXG4gICAgICAgIGVtYWlsOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgICBzdGFuZGFyZEF0dHJpYnV0ZXM6IHtcclxuICAgICAgICBlbWFpbDoge1xyXG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgICBtdXRhYmxlOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICAgIHVzZXJWZXJpZmljYXRpb246IHtcclxuICAgICAgICBlbWFpbFN0eWxlOiBjb2duaXRvLlZlcmlmaWNhdGlvbkVtYWlsU3R5bGUuQ09ERSwgLy8gQ09ERSBvciBMSU5LXHJcbiAgICAgICAgZW1haWxTdWJqZWN0OiBcIlZlcmlmeSB5b3VyIGVtYWlsIGZvciBNZXRhbE1lbnRhbCBCbG9nIVwiLFxyXG4gICAgICAgIGVtYWlsQm9keTogXCJUaGFua3MgZm9yIHNpZ25pbmcgdXAgdG8gTWV0YWxNZW50YWwgQmxvZyEgWW91ciB2ZXJpZmljYXRpb24gY29kZSBpcyB7IyMjI31cIixcclxuICAgICAgICBzbXNNZXNzYWdlOiBcIlRoYW5rcyBmb3Igc2lnbmluZyB1cCB0byBNZXRhbE1lbnRhbCBCbG9nISBZb3VyIHZlcmlmaWNhdGlvbiBjb2RlIGlzIHsjIyMjfVwiLFxyXG4gICAgICB9LFxyXG4gICAgICBlbWFpbDogY29nbml0by5Vc2VyUG9vbEVtYWlsLndpdGhTRVMoe1xyXG4gICAgICAgIHNlc1JlZ2lvbjogXCJ1cy13ZXN0LTJcIixcclxuICAgICAgICBmcm9tTmFtZTogXCJNZXRhbE1lbnRhbCBCbG9nXCIsXHJcbiAgICAgICAgZnJvbUVtYWlsOiBcImZsdXBpbm9AbWV0YWxtZW50YWwubmV0XCIsXHJcbiAgICAgIH0pLFxyXG4gICAgICBzaWduSW5DYXNlU2Vuc2l0aXZlOiBmYWxzZSxcclxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSxcclxuICAgIH0pO1xyXG4gICAgLy8g44K144OW44OJ44Oh44Kk44Oz44Gn44GC44KL44GT44GoPyDopqrjg4njg6HjgqTjg7Pjgavjga9B44Os44Kz44O844OJ44KSMTI3LjAuMC4x44Gn6Imv44GE44Gu44Gn6Kit5a6a44GX44Gm44GK44GP44GT44GoXHJcbiAgICAvLyBBQ03jga7jg6rjg7zjgrjjg6fjg7Pjga/jg5Djg7zjgrjjg4vjgqLjga7jgb9cclxuICAgIGNvbnN0IGNlcnRpZmljYXRlQXJuID0gcGFyYW0uY29nbml0by5jZXJ0aWZpY2F0ZUFybjtcclxuICAgIGNvbnN0IGNlcnRpZmljYXRlID0gY2VydG1nci5DZXJ0aWZpY2F0ZS5mcm9tQ2VydGlmaWNhdGVBcm4odGhpcywgXCJDb2duaXRvQ2VydGlmaWNhdGVcIiwgY2VydGlmaWNhdGVBcm4pO1xyXG4gICAgY29nbml0b1VzZXJQb29sLmFkZERvbWFpbihcIkN1c3RvbURvbWFpblwiLCB7XHJcbiAgICAgIGN1c3RvbURvbWFpbjoge1xyXG4gICAgICAgIGRvbWFpbk5hbWU6IFwiZGV2LmF1dGgubWV0YWxtZW50YWwubmV0XCIsXHJcbiAgICAgICAgY2VydGlmaWNhdGU6IGNlcnRpZmljYXRlLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCB1c2VyUG9vbENsaWVudCA9IGNvZ25pdG9Vc2VyUG9vbC5hZGRDbGllbnQocGFyYW0uY29nbml0by51c2VyUG9vbENsaWVudE5hbWUsIHtcclxuICAgICAgdXNlclBvb2xDbGllbnROYW1lOiBwYXJhbS5jb2duaXRvLnVzZXJQb29sQ2xpZW50TmFtZSxcclxuICAgICAgYXV0aEZsb3dzOiB7XHJcbiAgICAgICAgdXNlclNycDogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgZ2VuZXJhdGVTZWNyZXQ6IGZhbHNlLFxyXG4gICAgICBwcmV2ZW50VXNlckV4aXN0ZW5jZUVycm9yczogdHJ1ZSxcclxuICAgICAgc3VwcG9ydGVkSWRlbnRpdHlQcm92aWRlcnM6IFtjb2duaXRvLlVzZXJQb29sQ2xpZW50SWRlbnRpdHlQcm92aWRlci5DT0dOSVRPXSxcclxuICAgICAgb0F1dGg6IHtcclxuICAgICAgICBmbG93czoge1xyXG4gICAgICAgICAgYXV0aG9yaXphdGlvbkNvZGVHcmFudDogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNjb3BlczogW2NvZ25pdG8uT0F1dGhTY29wZS5PUEVOSUQsIGNvZ25pdG8uT0F1dGhTY29wZS5FTUFJTCwgY29nbml0by5PQXV0aFNjb3BlLlBST0ZJTEVdLFxyXG4gICAgICAgIGNhbGxiYWNrVXJsczogW1wiaHR0cHM6Ly9kZXYubWV0YWxtZW50YWwubmV0L1wiXSxcclxuICAgICAgICBsb2dvdXRVcmxzOiBbXCJodHRwczovL2Rldi5hdXRoLm1ldGFsbWVudGFsLm5ldC9cIl0sXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgLy8vIElkZW50aXR5IFBvb2wgLy8vXHJcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy9cclxuICAgIGNvbnN0IGNvZ25pdG9JZGVudGl0eVBvb2wgPSBuZXcgY29nbml0by5DZm5JZGVudGl0eVBvb2wodGhpcywgcGFyYW0uY29nbml0by5pZGVudGl0eVBvb2xOYW1lLCB7XHJcbiAgICAgIGlkZW50aXR5UG9vbE5hbWU6IHBhcmFtLmNvZ25pdG8uaWRlbnRpdHlQb29sTmFtZSxcclxuICAgICAgYWxsb3dVbmF1dGhlbnRpY2F0ZWRJZGVudGl0aWVzOiBmYWxzZSxcclxuICAgICAgY29nbml0b0lkZW50aXR5UHJvdmlkZXJzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgY2xpZW50SWQ6IHVzZXJQb29sQ2xpZW50LnVzZXJQb29sQ2xpZW50SWQsXHJcbiAgICAgICAgICBwcm92aWRlck5hbWU6IGNvZ25pdG9Vc2VyUG9vbC51c2VyUG9vbFByb3ZpZGVyTmFtZSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBjb2duaXRvUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCBwYXJhbS5jb2duaXRvLnJvbGVOYW1lLCB7XHJcbiAgICAgIHJvbGVOYW1lOiBwYXJhbS5jb2duaXRvLnJvbGVOYW1lLFxyXG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uRmVkZXJhdGVkUHJpbmNpcGFsKFxyXG4gICAgICAgIFwiY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tXCIsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgU3RyaW5nRXF1YWxzOiB7XHJcbiAgICAgICAgICAgIFwiY29nbml0by1pZGVudGl0eS5hbWF6b25hd3MuY29tOmF1ZFwiOiBjb2duaXRvSWRlbnRpdHlQb29sLnJlZixcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBcIkZvckFueVZhbHVlOlN0cmluZ0xpa2VcIjoge1xyXG4gICAgICAgICAgICBcImNvZ25pdG8taWRlbnRpdHkuYW1hem9uYXdzLmNvbTphbXJcIjogXCJhdXRoZW50aWNhdGVkXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzdHM6QXNzdW1lUm9sZVdpdGhXZWJJZGVudGl0eVwiLFxyXG4gICAgICApLFxyXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NJb1RGdWxsQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NJb1REYXRhQWNjZXNzXCIpLCBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXCJBV1NJb1RDb25maWdBY2Nlc3NcIildLFxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBjZm5JZGVudGl0eVBvb2xSb2xlQXR0YWNobWVudCA9IG5ldyBjb2duaXRvLkNmbklkZW50aXR5UG9vbFJvbGVBdHRhY2htZW50KHRoaXMsIFwiY2ZuSWRlbnRpdHlQb29sUm9sZUF0dGFjaG1lbnRcIiwge1xyXG4gICAgICBpZGVudGl0eVBvb2xJZDogY29nbml0b0lkZW50aXR5UG9vbC5yZWYsXHJcbiAgICAgIHJvbGVzOiB7XHJcbiAgICAgICAgYXV0aGVudGljYXRlZDogY29nbml0b1JvbGUucm9sZUFybixcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vXHJcbiAgICAvLy8gSW9UIFBvbGljeSAvLy9cclxuICAgIC8vLy8vLy8vLy8vLy8vLy8vL1xyXG4gICAgY29uc3QgaW90UG9saWN5ID0gbmV3IGlvdC5DZm5Qb2xpY3kodGhpcywgcGFyYW0uaW90LnBvbGljeU5hbWUsIHtcclxuICAgICAgcG9saWN5TmFtZTogcGFyYW0uaW90LnBvbGljeU5hbWUsXHJcbiAgICAgIHBvbGljeURvY3VtZW50OiB7XHJcbiAgICAgICAgVmVyc2lvbjogXCIyMDEyLTEwLTE3XCIsXHJcbiAgICAgICAgU3RhdGVtZW50OiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIEVmZmVjdDogXCJBbGxvd1wiLFxyXG4gICAgICAgICAgICBBY3Rpb246IFtcImlvdDoqXCJdLFxyXG4gICAgICAgICAgICBSZXNvdXJjZTogXCIqXCIsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGlvdFBvbGljeVByaW5jaXBhbEF0dGFjaG1lbnQgPSBuZXcgaW90LkNmblBvbGljeVByaW5jaXBhbEF0dGFjaG1lbnQodGhpcywgXCJpb3RQb2xpY3lQcmluY2lwYWxBdHRhY2htZW50XCIsIHtcclxuICAgICAgcG9saWN5TmFtZTogaW90UG9saWN5LnBvbGljeU5hbWUgYXMgc3RyaW5nLFxyXG4gICAgICBwcmluY2lwYWw6IGNvZ25pdG9JZGVudGl0eVBvb2wucmVmLFxyXG4gICAgfSk7XHJcbiAgICBpb3RQb2xpY3lQcmluY2lwYWxBdHRhY2htZW50Lm5vZGUuYWRkRGVwZW5kZW5jeShpb3RQb2xpY3kpO1xyXG4gIH1cclxufVxyXG4iXX0=