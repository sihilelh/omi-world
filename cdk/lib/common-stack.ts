import { App, Stack, StackProps } from "aws-cdk-lib";
import { CreateUserPool } from "../cognito/userPool";

export class CommonStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Initialize Cognito User Pools
    new CreateUserPool(this);
  }
}
