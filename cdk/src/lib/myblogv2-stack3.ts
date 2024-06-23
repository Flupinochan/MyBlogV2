import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as certmgr from "aws-cdk-lib/aws-certificatemanager";
import * as iot from "aws-cdk-lib/aws-iot";

import * as path from "path";
import { Construct } from "constructs";
import { Duration } from "aws-cdk-lib";

import { MyBlogParam3V2 } from "./parameters3";

const param = new MyBlogParam3V2();

export class Myblogv2Stack3 extends cdk.Stack {
  public readonly api: apigw.LambdaRestApi;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": cognitoIdentityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity",
      ),
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
      policyName: iotPolicy.policyName as string,
      principal: cognitoIdentityPool.ref,
    });
    iotPolicyPrincipalAttachment.node.addDependency(iotPolicy);
  }
}
