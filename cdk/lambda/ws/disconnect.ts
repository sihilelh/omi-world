import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE_NAME || "WebSocketConnections";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId;

    console.log("WebSocket Disconnect - Debug Info:", {
      connectionId,
    });

    // Remove connection from DynamoDB
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: CONNECTIONS_TABLE,
          Key: { connectionId },
        })
      );

      console.log("WebSocket Disconnect - Success:", {
        connectionId,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Disconnected successfully",
          connectionId,
        }),
      };
    } catch (dbError) {
      console.error("WebSocket Disconnect - Database error:", dbError);
      // Don't fail the disconnect if DB cleanup fails
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Disconnected (cleanup may have failed)",
          connectionId,
        }),
      };
    }
  } catch (error) {
    console.error("WebSocket Disconnect - Unexpected error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
      }),
    };
  }
};

