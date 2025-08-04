import { CfnOutput, Stack } from "aws-cdk-lib";
import { AttributeType, TableV2 } from "aws-cdk-lib/aws-dynamodb";

export const SESSIONS_TABLE_NAME = "OmiWorldAppSessions";
export const ROUNDS_TABLE_NAME = "OmiWorldAppRounds";
export const MOVES_TABLE_NAME = "OmiWorldAppMoves";
export const CONNECTIONS_TABLE_NAME = "OmiWorldAppWebSocketConnections";

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
    this.sessionTable = new TableV2(scope, "OmiWorldAppSessions", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
    });

    this.roundsTable = new TableV2(scope, "OmiWorldAppRounds", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
    });

    this.movesTable = new TableV2(scope, "OmiWorldAppMoves", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
    });

    this.connectionsTable = new TableV2(
      scope,
      "OmiWorldAppWebSocketConnections",
      {
        partitionKey: {
          name: "connectionId",
          type: AttributeType.STRING,
        },
        timeToLiveAttribute: "ttl",
      }
    );

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
