import { CfnOutput, Stack } from "aws-cdk-lib";
import {
  AccountRecovery,
  CfnUserPoolGroup,
  UserPool,
  UserPoolClient,
  VerificationEmailStyle,
} from "aws-cdk-lib/aws-cognito";

export class CreateUserPool {
  constructor(scope: Stack) {
    // User Pool
    const userPool = this.createUserPools(scope);

    // User Pool Client
    const userPoolClient = this.createUserClient(scope, userPool);

    // User Pool Groups
    this.createUserGroup(scope, userPool);

    // Outputs
    new CfnOutput(scope, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(scope, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
  }
  private createUserPools(stack: Stack) {
    return new UserPool(stack, "OmiUserPool", {
      userPoolName: "OmiUsers",
      signInAliases: {
        email: true,
        username: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
      },
      selfSignUpEnabled: true,
      userVerification: {
        emailStyle: VerificationEmailStyle.LINK,
        emailSubject: `Welcome to OmiApp`,
        emailBody: [
          "Hello {username},",
          "Thank you for signing up for OmiApp!",
          "Please verify your email address by clicking the link below:\n{##Verify Email##}",
          "If you did not request this, please ignore this email.",
          "Best regards,",
          "The OmiApp Team",
        ].join("\n\n"),
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
    });
  }
  private createUserClient(stack: Stack, userPool: UserPool) {
    return new UserPoolClient(stack, "OmiUserPoolClient", {
      userPool,
      userPoolClientName: "OmiAppClient",
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });
  }
  private createUserGroup(stack: Stack, userPool: UserPool) {
    return new CfnUserPoolGroup(stack, "OmiPlayersGroup", {
      groupName: "OmiPlayers",
      userPoolId: userPool.userPoolId,
      description: "Omi App Players",
    });
  }
}
