import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { verifyCognitoToken } from "../../utils/auth.util";

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE_NAME || "WebSocketConnections";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId;
    const queryParams = event.queryStringParameters || {};
    const token = queryParams.token;
    const sessionId = queryParams.sessionId;

    console.log("WebSocket Connect - Debug Info:", {
      connectionId,
      sessionId,
      hasToken: !!token,
    });

    // Validate required parameters
    if (!token) {
      console.error("WebSocket Connect - Missing token");
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: "Unauthorized: Missing access token",
        }),
      };
    }

    if (!sessionId) {
      console.error("WebSocket Connect - Missing sessionId");
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Bad Request: Missing sessionId",
        }),
      };
    }

    // Verify Cognito token
    const user = await verifyCognitoToken(token);
    if (!user) {
      console.error("WebSocket Connect - Invalid token");
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: "Unauthorized: Invalid access token",
        }),
      };
    }

    const userId = user.username;

    // Store connection in DynamoDB
    const connectionData = {
      connectionId,
      sessionId,
      userId,
      timestamp: Date.now(),
      ttl: Math.floor(Date.now() / 1000) + 10800, // 3 hours TTL
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: CONNECTIONS_TABLE,
          Item: connectionData,
        })
      );

      console.log("WebSocket Connect - Success:", {
        connectionId,
        sessionId,
        userId,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Connected successfully",
          connectionId,
          sessionId,
        }),
      };
    } catch (dbError) {
      console.error("WebSocket Connect - Database error:", dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Internal Server Error: Failed to store connection",
        }),
      };
    }
  } catch (error) {
    console.error("WebSocket Connect - Unexpected error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
      }),
    };
  }
};

