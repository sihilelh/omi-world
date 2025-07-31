import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  DeleteCommand,
  GetCommand,
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
  action: string;
  body: any;
  timestamp?: number;
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
  message: WebSocketMessage,
  sessionId: string,
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
      action: message.action,
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
 * Send message to a specific player by slot
 */
export const sendToPlayerSlot = async (
  message: WebSocketMessage,
  sessionId: string,
  playerSlot: number,
  webSocketEndpoint: string
) => {
  try {
    const connections = await getSessionConnections(sessionId);

    if (connections.length === 0) {
      console.log("WebSocket Util - No connections to send to:", {
        sessionId,
        playerSlot,
      });
      return;
    }

    // Find the connection for the specific player slot
    // We need to get the session to find which userId corresponds to the playerSlot
    const sessionResult = await docClient.send(
      new GetCommand({
        TableName: process.env.SESSIONS_TABLE_NAME || "OmiWorldSessions",
        Key: { pk: sessionId },
      })
    );

    if (!sessionResult.Item) {
      console.log("WebSocket Util - Session not found:", {
        sessionId,
        playerSlot,
      });
      return;
    }

    const session = sessionResult.Item;
    const targetPlayer = session.players.find(
      (player: any) => player.slot === playerSlot
    );

    if (!targetPlayer) {
      console.log("WebSocket Util - Player not found for slot:", {
        sessionId,
        playerSlot,
      });
      return;
    }

    const targetConnection = connections.find(
      (connection) => connection.userId === targetPlayer.userId
    );

    if (!targetConnection) {
      console.log("WebSocket Util - No connection found for player slot:", {
        sessionId,
        playerSlot,
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

    console.log("WebSocket Util - Sending message to player slot:", {
      sessionId,
      playerSlot,
      action: message.action,
      connectionId: targetConnection.connectionId,
    });

    // Send message to specific connection
    await apiGatewayManagementApi.send(
      new PostToConnectionCommand({
        ConnectionId: targetConnection.connectionId,
        Data: messageData,
      })
    );

    console.log("WebSocket Util - Message sent successfully to player slot:", {
      sessionId,
      playerSlot,
      connectionId: targetConnection.connectionId,
    });
  } catch (error) {
    console.error("WebSocket Util - Error sending to player slot:", error);
  }
};

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
