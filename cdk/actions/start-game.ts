import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { broadcastToSession } from "../utils/websocket.util";

interface StartGameParams {
  connectionId: string;
  docClient: DynamoDBDocumentClient;
  sessionsTable: string;
  connectionsTable: string;
  webSocketEndpoint?: string;
}

interface StartGameResult {
  statusCode: number;
  body: string;
}

export const startGame = async ({
  connectionId,
  docClient,
  sessionsTable,
  connectionsTable,
  webSocketEndpoint,
}: StartGameParams): Promise<StartGameResult> => {
  try {
    // Get connection info to find sessionId and userId
    const connectionResult = await docClient.send(
      new GetCommand({
        TableName: connectionsTable,
        Key: { connectionId },
      })
    );

    if (!connectionResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Connection not found",
        }),
      };
    }

    const { sessionId, userId } = connectionResult.Item;

    if (!sessionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Session ID not found in connection",
        }),
      };
    }

    // Get session info
    const sessionResult = await docClient.send(
      new GetCommand({
        TableName: sessionsTable,
        Key: { pk: sessionId },
      })
    );

    if (!sessionResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Session not found",
        }),
      };
    }

    const session = sessionResult.Item;

    // Check if user is the session creator
    if (session.createdUser !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "Only the session creator can start the game",
        }),
      };
    }

    // Check if session is in waiting status
    if (session.status !== "waiting") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Game can only be started when session is in waiting status",
        }),
      };
    }

    if (session.players.length !== 4) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Game can only be started when session has 4 players",
        }),
      };
    }

    // Update session status to active
    session.status = "active";
    await docClient.send(
      new PutCommand({
        TableName: sessionsTable,
        Item: session,
      })
    );

    // Broadcast game started message to all connected users
    if (webSocketEndpoint) {
      try {
        await broadcastToSession(
          {
            action: "GAME_STARTED",
            body: {
              sessionId,
              startedBy: userId,
              timestamp: new Date().toISOString(),
            },
          },
          sessionId,
          webSocketEndpoint
        );

        console.log("Start Game Action - Game started broadcast sent:", {
          sessionId,
          startedBy: userId,
        });
      } catch (broadcastError) {
        console.error("Start Game Action - Broadcast error:", broadcastError);
        // Don't fail the game start if broadcast fails
      }
    } else {
      console.warn("Start Game Action - WebSocket endpoint not configured");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        action: "GAME_START_SUCCESS",
        body: {
          message: "Game started successfully",
          sessionId,
          status: "active",
        },
      }),
    };
  } catch (error) {
    console.error("Start Game Action - Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
      }),
    };
  }
};
