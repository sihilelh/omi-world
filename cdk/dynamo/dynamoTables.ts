import { CfnOutput, Stack } from "aws-cdk-lib";
import { AttributeType, TableV2 } from "aws-cdk-lib/aws-dynamodb";

export const SESSIONS_TABLE_NAME = "OmiWorldSessions";
export const ROUNDS_TABLE_NAME = "OmiWorldRounds";
export const MOVES_TABLE_NAME = "OmiWorldMoves";
export const CONNECTIONS_TABLE_NAME = "WebSocketConnections";

export class CreateDynamoDBTables {
  public sessionTable: TableV2;
  public roundsTable: TableV2;
  public movesTable: TableV2;
  public connectionsTable: TableV2;

  constructor(scope: Stack) {
    this.createTables(scope);

    // Output table names
    new CfnOutput(scope, "SessionsTableName", {
      value: this.sessionTable.tableName,
      exportName: "CommonStack-SessionsTableName",
    });

    new CfnOutput(scope, "RoundsTableName", {
      value: this.roundsTable.tableName,
      exportName: "CommonStack-RoundsTableName",
    });

    new CfnOutput(scope, "MovesTableName", {
      value: this.movesTable.tableName,
      exportName: "CommonStack-MovesTableName",
    });

    new CfnOutput(scope, "ConnectionsTableName", {
      value: this.connectionsTable.tableName,
      exportName: "CommonStack-ConnectionsTableName",
    });
  }

  private createTables(scope: Stack) {
    this.sessionTable = new TableV2(scope, "OmiWorldSessions", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
    });

    this.roundsTable = new TableV2(scope, "OmiWorldRounds", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
    });

    this.movesTable = new TableV2(scope, "OmiWorldMoves", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
    });

    this.connectionsTable = new TableV2(scope, "WebSocketConnections", {
      partitionKey: {
        name: "connectionId",
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: "ttl",
    });

    // Add GSI for querying connections by sessionId
    this.connectionsTable.addGlobalSecondaryIndex({
      indexName: "SessionIdIndex",
      partitionKey: {
        name: "sessionId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "timestamp",
        type: AttributeType.NUMBER,
      },
    });
  }
}
