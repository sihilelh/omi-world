import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { broadcastToSession, sendToPlayerSlot } from "../utils/websocket.util";
import { randomInt } from "crypto";

interface StartRoundParams {
  connectionId: string;
  docClient: DynamoDBDocumentClient;
  sessionsTable: string;
  roundsTable: string;
  connectionsTable: string;
  webSocketEndpoint?: string;
}

interface StartRoundResult {
  statusCode: number;
  body: string;
}

// Card deck constants
const SUIT_SET = ["Spades", "Hearts", "Clubs", "Diamonds"];
const CARD_SET = ["7", "8", "9", "10", "J", "Q", "K", "A"];

// Utility functions for card handling
function swap(arr: number[], i: number, j: number): number[] {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
  return arr;
}

function decodeCard(number: number): { suit: string; card: string } {
  const suit = SUIT_SET[Math.floor(number / 8)];
  const card = CARD_SET[number % 8];
  return { suit, card };
}

function generateShuffledDeck(seed: number): number[] {
  const cardPack: number[] = [];

  // Generate 32-card deck (0-31)
  for (let i = 0; i < 32; i++) {
    cardPack.push(i);
  }

  // LCG shuffle using BigInt to handle large numbers safely
  let lcgNum = BigInt(seed);
  for (let i = 31; i >= 0; i--) {
    lcgNum = (1664525n * lcgNum + 1013904223n) % 2n ** 32n;
    const shuffleIndex = Number(lcgNum % BigInt(i + 1));
    swap(cardPack, i, shuffleIndex);
  }

  return cardPack;
}

function distributeCards(shuffledDeck: number[]): { [slot: number]: number[] } {
  const playerHands: { [slot: number]: number[] } = {
    0: [], // Team Red - Slot 0
    1: [], // Team Black - Slot 1
    2: [], // Team Red - Slot 2
    3: [], // Team Black - Slot 3
  };

  // Distribute cards to each player (8 cards each)
  for (let i = 0; i < 32; i++) {
    const playerSlot = i % 4;
    playerHands[playerSlot].push(shuffledDeck[i]);
  }

  return playerHands;
}

export const startRound = async ({
  connectionId,
  docClient,
  sessionsTable,
  roundsTable,
  connectionsTable,
  webSocketEndpoint,
}: StartRoundParams): Promise<StartRoundResult> => {
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

    // Check if session is active
    if (session.status !== "active") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Round can only be started when session is active",
        }),
      };
    }

    // Check if we have 4 players
    if (session.players.length !== 4) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Round can only be started with 4 players",
        }),
      };
    }

    // Generate round ID and seed
    const roundId = `${sessionId}_round_${session.currentRound + 1}`;
    const seed = randomInt(0, 2 ** 32 - 1);

    // Generate shuffled deck and distribute cards
    const shuffledDeck = generateShuffledDeck(seed);
    const playerHands = distributeCards(shuffledDeck);

    // Create round record
    const roundData = {
      pk: roundId,
      sessionId,
      seed,
      trickSuit: null,
      playerHands,
      moveWins: {
        TEAM_RED: 0,
        TEAM_BLACK: 0,
      },
      status: "waiting_for_trick_suit",
      createdAt: new Date().toISOString(),
    };

    // Save round to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: roundsTable,
        Item: roundData,
      })
    );

    // Update session with new round number
    session.currentRound += 1;
    await docClient.send(
      new PutCommand({
        TableName: sessionsTable,
        Item: session,
      })
    );

    // Broadcast round start message to all players
    if (webSocketEndpoint) {
      try {
        // Send ROUND_START message
        await broadcastToSession(
          {
            action: "ROUND_START",
            body: {
              roundId,
              sessionId,
              currentRound: session.currentRound,
              activeSlot: session.currentActiveSlot,
              timestamp: new Date().toISOString(),
            },
          },
          sessionId,
          webSocketEndpoint
        );

        // Send first 4 cards only to the active player
        const activePlayer = session.players.find(
          (player: any) => player.slot === session.currentActiveSlot
        );

        if (activePlayer) {
          const firstFourCards = playerHands[activePlayer.slot].slice(0, 4);

          await sendToPlayerSlot(
            {
              action: "RECEIVE_CARD_SET",
              body: {
                roundId,
                sessionId,
                playerSlot: activePlayer.slot,
                cards: firstFourCards.map((cardNum) => ({
                  number: cardNum,
                  ...decodeCard(cardNum),
                })),
                isFirstSet: true,
                timestamp: new Date().toISOString(),
              },
            },
            sessionId,
            activePlayer.slot,
            webSocketEndpoint
          );
        }

        console.log(
          "Start Round Action - Round started and cards distributed:",
          {
            roundId,
            sessionId,
            currentRound: session.currentRound,
          }
        );
      } catch (broadcastError) {
        console.error("Start Round Action - Broadcast error:", broadcastError);
        // Don't fail the round start if broadcast fails
      }
    } else {
      console.warn("Start Round Action - WebSocket endpoint not configured");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        action: "ROUND_START_SUCCESS",
        body: {
          message: "Round started successfully",
          roundId,
          sessionId,
          currentRound: session.currentRound,
        },
      }),
    };
  } catch (error) {
    console.error("Start Round Action - Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
      }),
    };
  }
};

export const handleTrickSuitSelection = async ({
  connectionId,
  docClient,
  sessionsTable,
  roundsTable,
  connectionsTable,
  webSocketEndpoint,
  trickSuit,
}: StartRoundParams & { trickSuit: string }): Promise<StartRoundResult> => {
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

    // Find the current round
    const roundId = `${sessionId}_round_${session.currentRound}`;
    const roundResult = await docClient.send(
      new GetCommand({
        TableName: roundsTable,
        Key: { pk: roundId },
      })
    );

    if (!roundResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Round not found",
        }),
      };
    }

    const round = roundResult.Item;

    // Check if round is waiting for trick suit
    if (round.status !== "waiting_for_trick_suit") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Round is not waiting for trick suit selection",
        }),
      };
    }

    // Validate that the user is the active player
    const activePlayer = session.players.find(
      (player: any) => player.slot === session.currentActiveSlot
    );

    if (!activePlayer || activePlayer.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "Only the active player can select the trick suit",
        }),
      };
    }

    // Validate trick suit
    const validSuits = ["Spades", "Hearts", "Clubs", "Diamonds"];
    if (!validSuits.includes(trickSuit)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid trick suit",
        }),
      };
    }

    // Update round with trick suit
    round.trickSuit = trickSuit;
    round.status = "active";

    await docClient.send(
      new PutCommand({
        TableName: roundsTable,
        Item: round,
      })
    );

    // Broadcast trick suit selection and remaining cards
    if (webSocketEndpoint) {
      try {
        // Send TRICK_SUIT_SELECTED message
        await broadcastToSession(
          {
            action: "TRICK_SUIT_SELECTED",
            body: {
              roundId,
              sessionId,
              trickSuit,
              selectedBySlot: session.currentActiveSlot,
              timestamp: new Date().toISOString(),
            },
          },
          sessionId,
          webSocketEndpoint
        );

        // Send all 8 cards to each player with trick suit info
        for (const player of session.players) {
          const allCards = round.playerHands[player.slot];

          await sendToPlayerSlot(
            {
              action: "RECEIVE_CARD_SET",
              body: {
                roundId,
                sessionId,
                playerSlot: player.slot,
                cards: allCards.map((cardNum: number) => ({
                  number: cardNum,
                  ...decodeCard(cardNum),
                })),
                isFirstSet: false,
                trickSuit,
                timestamp: new Date().toISOString(),
              },
            },
            sessionId,
            player.slot,
            webSocketEndpoint
          );
        }

        console.log(
          "Trick Suit Selection - Trick suit selected and remaining cards distributed:",
          {
            roundId,
            sessionId,
            trickSuit,
            selectedBySlot: session.currentActiveSlot,
          }
        );
      } catch (broadcastError) {
        console.error(
          "Trick Suit Selection - Broadcast error:",
          broadcastError
        );
        // Don't fail the trick suit selection if broadcast fails
      }
    } else {
      console.warn("Trick Suit Selection - WebSocket endpoint not configured");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        action: "TRICK_SUIT_SELECTION_SUCCESS",
        body: {
          message: "Trick suit selected successfully",
          roundId,
          sessionId,
          trickSuit,
        },
      }),
    };
  } catch (error) {
    console.error("Trick Suit Selection - Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
      }),
    };
  }
};

// Process Flow
// 1. startRound() - Phase 1: Round Initialization
//    - Create a seed for the round (Send: ROUND_START to all players)
//    - Generate shuffled deck using LCG algorithm with BigInt
//    - Distribute cards to player hands (8 cards each)
//    - Send first 4 cards ONLY to the active player (session.currentActiveSlot)
//    - Create round record in DynamoDB with status: "waiting_for_trick_suit"
//    - Update session with new round number
//
// 2. handleTrickSuitSelection() - Phase 2: Trick Suit Selection
//    - Validate that only the active player can select trick suit
//    - Update round table with trick suit data and status: "active"
//    - Send TRICK_SUIT_SELECTED message to all players
//    - Send ALL 8 cards to each player individually with trick suit info
//    - Each player receives their complete hand privately
//
// Privacy: Each player only sees their own cards via individual WebSocket messages
// Timing: Active player gets 4 cards first, then all players get complete hands after trick suit
