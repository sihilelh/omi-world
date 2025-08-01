import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { startGame } from "../../actions/start-game";
import {
  startRound,
  handleTrickSuitSelection,
} from "../../actions/start-round";
import { playACard } from "../../actions/play-card";

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const SESSIONS_TABLE = process.env.SESSIONS_TABLE_NAME || "OmiWorldSessions";
const ROUNDS_TABLE = process.env.ROUNDS_TABLE_NAME || "OmiWorldRounds";
const MOVES_TABLE = process.env.MOVES_TABLE_NAME || "OmiWorldMoves";
const CONNECTIONS_TABLE =
  process.env.CONNECTIONS_TABLE_NAME || "OmiWorldConnections";
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body || "{}");

    console.log("WebSocket Default - Debug Info:", {
      connectionId,
      body,
    });

    // For now, just acknowledge the message
    // This can be extended later for handling specific message types

    switch (body?.action) {
      case "HEALTH":
        return {
          statusCode: 200,
          body: JSON.stringify({
            action: "HEALTH",
            body: {
              status: "OK",
              timestamp: new Date().toISOString(),
            },
            connectionId,
          }),
        };
        break;
      case "GAME_START":
        return await startGame({
          connectionId: connectionId!,
          docClient,
          sessionsTable: SESSIONS_TABLE,
          connectionsTable: CONNECTIONS_TABLE,
          webSocketEndpoint: WEBSOCKET_ENDPOINT,
        });
      case "ROUND_START":
        return await startRound({
          connectionId: connectionId!,
          docClient,
          sessionsTable: SESSIONS_TABLE,
          roundsTable: ROUNDS_TABLE,
          connectionsTable: CONNECTIONS_TABLE,
          webSocketEndpoint: WEBSOCKET_ENDPOINT,
        });
      case "TRICK_SUIT_SELECT":
        return await handleTrickSuitSelection({
          connectionId: connectionId!,
          docClient,
          sessionsTable: SESSIONS_TABLE,
          roundsTable: ROUNDS_TABLE,
          connectionsTable: CONNECTIONS_TABLE,
          webSocketEndpoint: WEBSOCKET_ENDPOINT,
          trickSuit: body.body.trickSuit,
        });

      case "PLAY_CARD":
        return await playACard({
          connectionId: connectionId!,
          docClient,
          sessionsTable: SESSIONS_TABLE,
          roundsTable: ROUNDS_TABLE,
          moveRecordsTable: MOVES_TABLE,
          connectionsTable: CONNECTIONS_TABLE,
          webSocketEndpoint: WEBSOCKET_ENDPOINT,
          playedCard: body.body.playedCard,
        });

      default:
        return {
          statusCode: 200,
          body: JSON.stringify({
            action: "default",
            body: {
              message: "Message received, but no valid action specified",
              mentionedAction: body?.action,
              timestamp: new Date().toISOString(),
            },
            connectionId,
          }),
        };
        break;
    }
  } catch (error) {
    console.error("WebSocket Default - Unexpected error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
      }),
    };
  }
};
