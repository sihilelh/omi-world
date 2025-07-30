import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const CONNECTIONS_TABLE =
  process.env.CONNECTIONS_TABLE_NAME || "WebSocketConnections";

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

export interface UserJoinedMessage {
  type: "USER_JOINED";
  data: {
    userId: string;
    team: string;
    sessionId: string;
  };
}

/**
 * Get all connections for a specific session
 */
export const getSessionConnections = async (sessionId: string) => {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: CONNECTIONS_TABLE,
        IndexName: "SessionIdIndex",
        KeyConditionExpression: "sessionId = :sessionId",
        ExpressionAttributeValues: { ":sessionId": sessionId },
      })
    );

    console.log("WebSocket Util - Session connections:", {
      sessionId,
      count: result.Items?.length || 0,
    });

    return result.Items || [];
  } catch (error) {
    console.error("WebSocket Util - Error getting session connections:", error);
    return [];
  }
};

/**
 * Broadcast message to all connections in a session
 */
export const broadcastToSession = async (
  sessionId: string,
  message: WebSocketMessage,
  webSocketEndpoint: string
) => {
  try {
    const connections = await getSessionConnections(sessionId);

    if (connections.length === 0) {
      console.log("WebSocket Util - No connections to broadcast to:", {
        sessionId,
      });
      return;
    }

    // Validate endpoint format
    if (!webSocketEndpoint || !webSocketEndpoint.startsWith("https://")) {
      console.error(
        "WebSocket Util - Invalid endpoint format:",
        webSocketEndpoint
      );
      return;
    }

    const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
      endpoint: webSocketEndpoint,
    });

    const messageData = JSON.stringify({
      ...message,
      timestamp: Date.now(),
    });

    console.log("WebSocket Util - Broadcasting message:", {
      sessionId,
      messageType: message.type,
      connectionCount: connections.length,
      endpoint: webSocketEndpoint,
      connections: connections.map((c) => ({
        connectionId: c.connectionId,
        userId: c.userId,
      })),
    });

    // Send message to all connections in parallel with retry logic
    const sendPromises = connections.map(async (connection) => {
      const maxRetries = 3;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await apiGatewayManagementApi.send(
            new PostToConnectionCommand({
              ConnectionId: connection.connectionId,
              Data: messageData,
            })
          );
          return { success: true, connectionId: connection.connectionId };
        } catch (error: any) {
          lastError = error;

          // Don't retry on certain errors
          if (
            error.name === "GoneException" ||
            error.name === "LimitExceededException"
          ) {
            console.warn("WebSocket Util - Not retrying for error type:", {
              connectionId: connection.connectionId,
              errorName: error.name,
              attempt,
            });
            break;
          }

          if (attempt < maxRetries) {
            console.warn("WebSocket Util - Retry attempt:", {
              connectionId: connection.connectionId,
              attempt,
              error: error.message,
            });
            // Wait before retry (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, attempt) * 100)
            );
          }
        }
      }

      return {
        success: false,
        connectionId: connection.connectionId,
        error: lastError,
      };
    });

    const results = await Promise.all(sendPromises);

    // Log results
    const successful = results.filter((result) => result.success).length;
    const failed = results.filter((result) => !result.success).length;

    console.log("WebSocket Util - Broadcast results:", {
      sessionId,
      successful,
      failed,
      total: connections.length,
    });

    // Log any failed sends and collect stale connection IDs
    const staleConnectionIds: string[] = [];
    results.forEach((result) => {
      if (!result.success) {
        console.error("WebSocket Util - Failed to send to connection:", {
          connectionId: result.connectionId,
          error: result.error,
        });

        // If it's a GoneException, the connection is stale and should be cleaned up
        if (result.error?.name === "GoneException") {
          staleConnectionIds.push(result.connectionId);
        }
      }
    });

    // Clean up stale connections
    if (staleConnectionIds.length > 0) {
      await cleanupStaleConnections(staleConnectionIds);
    }
  } catch (error) {
    console.error("WebSocket Util - Error broadcasting to session:", error);
  }
};

/**
 * Create a user joined message
 */
export const createUserJoinedMessage = (
  userId: string,
  team: string,
  sessionId: string
): UserJoinedMessage => ({
  type: "USER_JOINED",
  data: {
    userId,
    team,
    sessionId,
  },
});

/**
 * Clean up stale connections from DynamoDB
 */
export const cleanupStaleConnections = async (connectionIds: string[]) => {
  if (connectionIds.length === 0) return;

  try {
    const deletePromises = connectionIds.map((connectionId) =>
      docClient.send(
        new DeleteCommand({
          TableName: CONNECTIONS_TABLE,
          Key: { connectionId },
        })
      )
    );

    await Promise.allSettled(deletePromises);

    console.log("WebSocket Util - Cleaned up stale connections:", {
      count: connectionIds.length,
      connectionIds,
    });
  } catch (error) {
    console.error(
      "WebSocket Util - Error cleaning up stale connections:",
      error
    );
  }
};
