import { App, Stack, StackProps } from "aws-cdk-lib";
import { CreateUserPool } from "../cognito/userPool";
import { CreateDynamoDBTables } from "../dynamo/dynamoTables";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";

export class CommonStack extends Stack {
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;

  public readonly sessionTable: TableV2;
  public readonly roundsTable: TableV2;
  public readonly movesTable: TableV2;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Initialize Cognito User Pools
    const userPool = new CreateUserPool(this);

    // Get the user pool and client IDs
    this.userPoolId = userPool.userPoolId;
    this.userPoolClientId = userPool.userPoolClientId;

    // Initialize Dynamo DB Tables
    const dynamoTables = new CreateDynamoDBTables(this);
    this.sessionTable = dynamoTables.sessionTable;
    this.roundsTable = dynamoTables.roundsTable;
    this.movesTable = dynamoTables.movesTable;
  }
}
