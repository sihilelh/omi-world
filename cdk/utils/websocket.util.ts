import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE_NAME || "WebSocketConnections";

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
      console.log("WebSocket Util - No connections to broadcast to:", { sessionId });
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
    });

    // Send message to all connections in parallel
    const sendPromises = connections.map((connection) =>
      apiGatewayManagementApi.send(
        new PostToConnectionCommand({
          ConnectionId: connection.connectionId,
          Data: messageData,
        })
      )
    );

    const results = await Promise.allSettled(sendPromises);
    
    // Log results
    const successful = results.filter((result) => result.status === "fulfilled").length;
    const failed = results.filter((result) => result.status === "rejected").length;
    
    console.log("WebSocket Util - Broadcast results:", {
      sessionId,
      successful,
      failed,
      total: connections.length,
    });

    // Log any failed sends
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error("WebSocket Util - Failed to send to connection:", {
          connectionId: connections[index]?.connectionId,
          error: result.reason,
        });
      }
    });
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