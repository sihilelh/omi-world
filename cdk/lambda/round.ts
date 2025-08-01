import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import {
  verifyCognitoToken,
  extractTokenFromHeaders,
} from "../utils/auth.util";
import { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { cb, cbError } from "../utils/cb.util";

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const ROUNDS_TABLE = process.env.ROUNDS_TABLE_NAME || "OmiWorldRounds";
const SESSIONS_TABLE = process.env.SESSIONS_TABLE_NAME || "OmiWorldSessions";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const httpMethod = event.requestContext.http.method;
    const path = event.rawPath;

    // Debug logging
    console.log("Round Lambda Debug Info:", {
      httpMethod,
      path,
      headers: event.headers,
    });

    switch (httpMethod) {
      case "GET":
        console.log("GET request received, proceeding to get round");
        return await getRound(event);
      default:
        return cb(405, {
          error: "Method Not Allowed",
          message: `HTTP method ${httpMethod} not supported`,
          allowedMethods: ["GET"],
        });
    }
  } catch (error) {
    console.error("Round Lambda Error:", error);
    return cbError(
      500,
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      },
      { error }
    );
  }
};

const getRound = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const roundId = event.pathParameters?.roundId;

    if (!roundId) {
      return cb(400, { error: "Round ID is required" });
    }

    // Get token from Authorization header
    const token = extractTokenFromHeaders(event);
    if (!token) {
      return cb(401, {
        error: "Unauthorized: Please provide an Authorization header",
      });
    }

    const user: CognitoAccessTokenPayload | null = await verifyCognitoToken(
      token
    );

    if (!user) {
      return cb(401, {
        error: "Unauthorized: Access token is invalid",
      });
    }

    const requestingUser = user.username;

    // Fetch the round from DynamoDB
    const roundResult = await docClient.send(
      new GetCommand({
        TableName: ROUNDS_TABLE,
        Key: { pk: roundId },
      })
    );

    if (!roundResult.Item) {
      return cb(404, { error: "Round not found" });
    }

    const round = roundResult.Item;

    // Get session info to validate user is part of the session
    const sessionResult = await docClient.send(
      new GetCommand({
        TableName: SESSIONS_TABLE,
        Key: { pk: round.sessionId },
      })
    );

    if (!sessionResult.Item) {
      return cb(404, { error: "Session not found" });
    }

    const session = sessionResult.Item;

    // Check if user is part of the session
    const userInSession = session.players.find(
      (player: any) => player.userId === requestingUser
    );

    if (!userInSession) {
      return cb(403, {
        error: "Forbidden: User is not part of this session",
      });
    }

    // Get user's slot
    const userSlot = userInSession.slot;

    // Get user's cards from playerHands
    const userCards = round.playerHands[userSlot] || [];

    // Decode cards for the user
    const SUIT_SET = ["SPADES", "HEARTS", "CLUBS", "DIAMONDS"];
    const CARD_SET = ["7", "8", "9", "10", "JACK", "QUEEN", "KING", "ACE"];

    function decodeCard(number: number): { suit: string; card: string } {
      const suit = SUIT_SET[Math.floor(number / 8)];
      const card = CARD_SET[number % 8];
      return { suit, card };
    }

    const decodedUserCards = userCards.map((cardNum: number) => ({
      number: cardNum,
      ...decodeCard(cardNum),
    }));

    // Check if round is in waiting_for_trick_suit status
    if (round.status === "waiting_for_trick_suit") {
      // If user is the active player, give them first 4 cards
      if (userSlot === session.currentActiveSlot) {
        const firstFourCards = userCards.slice(0, 4);
        const decodedFirstFourCards = firstFourCards.map((cardNum: number) => ({
          number: cardNum,
          ...decodeCard(cardNum),
        }));

        return cb(200, {
          roundId,
          sessionId: round.sessionId,
          userCards: decodedFirstFourCards, // Only first 4 cards for active player
          userSlot,
          currentSlot: session.currentActiveSlot,
          message:
            "Active player: You have received your first 4 cards. Select the trick suit to continue.",
          ...round, // Spread all other round fields dynamically
        });
      } else {
        // Non-active players get no cards until trick suit is selected
        return cb(200, {
          roundId,
          sessionId: round.sessionId,
          userCards: [], // No cards until trick suit is selected
          userSlot,
          currentSlot: session.currentActiveSlot,
          message:
            "Waiting for trick suit selection. Cards will be available after trick suit is chosen.",
          ...round, // Spread all other round fields dynamically
        });
      }
    }

    // Return round data with only user's cards (for privacy) - only after trick suit is selected
    return cb(200, {
      roundId,
      sessionId: round.sessionId,
      userCards: decodedUserCards,
      userSlot,
      currentSlot: session.currentActiveSlot,
      ...round, // Spread all other round fields dynamically
    });
  } catch (error) {
    console.log(`Error getting round:`, error);
    return cbError(500, { error: "Failed to get round" }, { error });
  }
};
