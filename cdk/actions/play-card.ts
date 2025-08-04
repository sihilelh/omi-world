// Process Flow

import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { SUIT_SET, CARD_SET, decodeCard } from "./start-round";
import { broadcastToSession } from "../utils/websocket.util";

// Get the round data ()
// If he is the moveActiveSlot user he is allowed to play any card he has in hand (he is the first player)
// if he is not the moveActiveSlot user and he have cards that is the same suit as fist player played card he is only allowed to play those cards
// if he is not the moveActiveSlot user and he does not have cards that is the same suit as fist player played card, he is allowed to play any another card

// How to win the move

// Each card have a value
// and the suit matters, player card's suit is the trickSuit it will add extra 8 to card's value

const CARD_VALUES = {
  "7": 1,
  "8": 2,
  "9": 3,
  "10": 4,
  JACK: 5,
  QUEEN: 6,
  KING: 7,
  ACE: 8,
};

function getCardValue(
  card: number,
  trickSuit: string,
  currentSuit: string
): number {
  const suit = SUIT_SET[Math.floor(card / 8)];
  const cardValue = CARD_SET[card % 8] as keyof typeof CARD_VALUES;
  if (suit === trickSuit) {
    return CARD_VALUES[cardValue] + 8;
  }
  // If card suit is not trick or current suit return 0
  if (suit !== trickSuit && suit !== currentSuit) {
    return 0;
  }
  return CARD_VALUES[cardValue];
}

// example: all players have hearts suited cards
// p1=hearts_ace (8) ,p2=hearts_10 (4), p3=hearts_7 (1), p4=hearts_8 (2)
// the team of p1 will win because he has the most valued card

// example: imagine the trick suit is clubs and player 3 ran out of heart suited cards
// p1=hearts_ace (8) ,p2=hearts_10 (4), p3=clubs_7 (8+1=9), p4=hearts_8 (2)
// the team of p3 will win because he has the most valued card

// when a player wins the move, the move win is belong to the team of the player (round table update)
// broadcast a message to all players that the move is won (MOVE_WON)

interface PlayACardParams {
  connectionId: string;
  docClient: DynamoDBDocumentClient;
  sessionsTable: string;
  roundsTable: string;
  moveRecordsTable: string;
  connectionsTable: string;
  webSocketEndpoint?: string;
  playedCard: number; // number from 0 to 31
}

// Session Related Interfaces
interface Session {
  pk: string; // Primary key (e.g., "mdsepyi7")
  createdAt: string; // ISO timestamp (e.g., "2025-08-01T05:52:39.513Z")
  createdUser: string; // User who created the session (e.g., "sihilelh")
  currentActiveSlot: 0 | 1 | 2 | 3; // Numeric slot indicator (can be float)
  currentRound: number; // Current round number
  players: Player[]; // Array of player objects
  status: string; // Session status (e.g., "active")
  teams: Team[]; // Array of team objects
  lastRoundTied?: boolean; // Is the last round tied
  lastRoundWinner?: "TEAM_RED" | "TEAM_BLACK"; // The winner of the last round
}

interface Player {
  userId: string;
  team: string;
  slot: 0 | 1 | 2 | 3;
}

interface Team {
  teamId: string;
  score: number;
}

// Round Related interfaces
interface Round {
  pk: string; // e.g., "mdsepyi7_round_1"
  createdAt: string; // ISO timestamp, e.g., "2025-08-01T05:53:15.824Z"
  currentMove: number; // Current move number
  currentMoveCards: { slot: 0 | 1 | 2 | 3; card: number }[]; // Cards played in the current move (empty array if none)
  currentSuit: string; // e.g., "ALL"
  moveActiveSlot: 0 | 1 | 2 | 3; // Which slot is active
  moveCurrentSlot: 0 | 1 | 2 | 3; // Current slot making a move
  moveWins: {
    TEAM_RED: 0;
    TEAM_BLACK: 0;
  }; // Map of team -> score, e.g., { TEAM_BLACK: 1, TEAM_RED: -2 }
  playerHands: {
    "0": number[];
    "1": number[];
    "2": number[];
    "3": number[];
  }; // Slot -> array of card IDs
  seed: number; // Random seed for round
  sessionId: string; // Links back to session (e.g., "mdsepyi7")
  status: string; // e.g., "active"
  trickSuit: string; // e.g., "SPADES"
}

interface MoveRecord {
  pk: string;
  playedCards?: { [key: number]: number };
  suit?: string;
  wonBy?: "TEAM_RED" | "TEAM_BLACK";
}

export const playACard = async ({
  connectionId,
  docClient,
  sessionsTable,
  roundsTable,
  moveRecordsTable,
  connectionsTable,
  webSocketEndpoint,
  playedCard,
}: PlayACardParams) => {
  if (!webSocketEndpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        action: "PLAY_CARD",
        error: "WebSocket endpoint is not provided",
      }),
    };
  }
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
        action: "PLAY_CARD",
        error: "No connection data found",
      }),
    };
  }

  const { sessionId, userId } = connectionResult.Item;

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
        action: "PLAY_CARD",
        error: "No session found",
      }),
    };
  }

  const session = sessionResult.Item as Session;

  const currentRoundResult = await docClient.send(
    new GetCommand({
      TableName: roundsTable,
      Key: { pk: `${sessionId}_round_${session.currentRound}` },
    })
  );

  if (!currentRoundResult.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        action: "PLAY_CARD",
        error: "No current round found",
      }),
    };
  }

  const currentRound = currentRoundResult.Item as Round;

  // Validate session state before allowing card play
  if (session.status !== "active:game_play") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        action: "PLAY_CARD",
        error: "Session is not in active:game_play state",
      }),
    };
  }

  // Validate that trick suit has been selected
  if (!currentRound.trickSuit) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        action: "PLAY_CARD",
        error: "Trick suit has not been selected yet",
      }),
    };
  }

  const thisPlayer = session.players.find((player) => player.userId === userId);

  if (!thisPlayer) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        action: "PLAY_CARD",
        error: "The player is not associated with the session",
      }),
    };
  }

  if (currentRound.moveCurrentSlot !== thisPlayer.slot) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        action: "PLAY_CARD",
        error: "Not your turn",
      }),
    };
  }

  // Check if he has the card in his hand
  if (currentRound.playerHands[thisPlayer.slot].includes(playedCard)) {
    const card = decodeCard(playedCard);

    // Handle the move record
    let moveRecord: MoveRecord;
    const currentMoveNumber = currentRound.currentMove; // This is the move currently being played

    // Create default moveRecord with only pk
    moveRecord = {
      pk: `${currentRound.pk}_move_${currentMoveNumber}`,
    };

    if (currentRound.currentMoveCards.length === 0) {
      // First card of the move - initialize the record
      moveRecord.playedCards = {
        [thisPlayer.slot]: playedCard,
      };
      moveRecord.suit = card.suit;
    } else {
      // Subsequent cards - update existing record
      const moveRecordResult = await docClient.send(
        new GetCommand({
          TableName: moveRecordsTable,
          Key: { pk: `${currentRound.pk}_move_${currentMoveNumber}` },
        })
      );
      if (!moveRecordResult.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            action: "PLAY_CARD",
            error: "No move record found",
          }),
        };
      }
      moveRecord = moveRecordResult.Item as MoveRecord;
      if (!moveRecord.playedCards) {
        moveRecord.playedCards = {};
      }
      moveRecord.playedCards[thisPlayer.slot] = playedCard;
    }

    const isFirstMove = currentRound.currentMoveCards.length === 0;

    // Check if he is not the first move player, validate the card suit
    if (
      currentRound.currentMoveCards.length !== 0 &&
      currentRound.currentSuit !== "ALL"
    ) {
      const hasSameSuitCard = currentRound.playerHands[thisPlayer.slot].some(
        (c) => decodeCard(c).suit === currentRound.currentSuit
      );
      // If user does not have the same suit card, he can play any card
      if (currentRound.currentSuit !== card.suit && hasSameSuitCard) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            action: "PLAY_CARD",
            error:
              "The player have the same suit card but played a different suit card",
          }),
        };
      }
    } else {
      // If user is the first move player, he can play any card and the current suit will be the suit of the card
      currentRound.currentSuit = card.suit;
    }

    // Update the current move cards
    currentRound.currentMoveCards.push({
      slot: thisPlayer.slot,
      card: playedCard,
    });

    // Remove the card from his hand
    currentRound.playerHands[thisPlayer.slot] = currentRound.playerHands[
      thisPlayer.slot
    ].filter((card) => card !== playedCard);

    // Update the move current slot to the next slot
    currentRound.moveCurrentSlot = ((currentRound.moveCurrentSlot + 1) % 4) as
      | 0
      | 1
      | 2
      | 3;

    // Broadcast card played to all players
    await broadcastToSession(
      {
        action: "CARD_PLAYED",
        body: {
          card: playedCard,
          slot: thisPlayer.slot,
          currentMove: currentRound.currentMove,
          isFirstMove,
          isLastMove: currentRound.currentMoveCards.length === 4,
          sessionStatus: session.status,
        },
      },
      sessionId,
      webSocketEndpoint
    );

    // Wining logic after all 4 players played a card
    if (currentRound.currentMoveCards.length === 4) {
      // Get the highest card value
      const cardsWithValues = currentRound.currentMoveCards.map((card) => {
        return {
          ...card,
          value: getCardValue(
            card.card,
            currentRound.trickSuit,
            currentRound.currentSuit
          ),
        };
      });
      const highestCard = cardsWithValues.reduce((max, card) => {
        return max.value > card.value ? max : card;
      });
      const winningTeam =
        highestCard.slot === 0 || highestCard.slot === 2
          ? "TEAM_RED"
          : "TEAM_BLACK";
      // Update the move wins
      currentRound.moveWins[winningTeam] += 1;
      moveRecord.wonBy = winningTeam;

      // Broadcast the move won to all players
      await broadcastToSession(
        {
          action: "MOVE_WON",
          body: {
            move: currentRound.currentMove,
            wonByTeam: winningTeam,
            wonBySlot: highestCard.slot,
            sessionStatus: session.status,
          },
        },
        sessionId,
        webSocketEndpoint
      );

      // Resetting and updating the current move cards, moves, suit
      currentRound.currentMoveCards = [];
      currentRound.currentMove = currentRound.currentMove + 1;
      currentRound.currentSuit = "ALL";

      // Update the move active slot to the winning slot
      currentRound.moveActiveSlot = highestCard.slot;
      currentRound.moveCurrentSlot = highestCard.slot;
    }

    // After 8 moves, the round is ended
    if (currentRound.currentMove > 8) {
      // Update the round status and session status to show the round summery modal in frontend
      session.status = "active:round_ended";

      // Is round score is tied
      const isRoundTied =
        currentRound.moveWins.TEAM_BLACK === currentRound.moveWins.TEAM_RED;

      const roundLostTeam = isRoundTied
        ? null
        : currentRound.moveWins.TEAM_BLACK < currentRound.moveWins.TEAM_RED
        ? "TEAM_BLACK"
        : "TEAM_RED";

      const roundWonTeam =
        roundLostTeam === "TEAM_RED" ? "TEAM_BLACK" : "TEAM_RED";

      if (isRoundTied) {
        session.lastRoundTied = true;
      } else {
        // Update round wins

        session.lastRoundWinner = roundWonTeam;

        if (session.lastRoundTied) {
          session.teams = session.teams.map((team) => {
            if (team.teamId === roundLostTeam) {
              team.score = team.score - 2;
            }
            return team;
          });
          // they chose the trick suit (currentActiveSlot) and lost the round so deduct 2 points from the team
        } else if (
          roundLostTeam === "TEAM_RED" &&
          (session.currentActiveSlot === 0 || session.currentActiveSlot === 2)
        ) {
          session.teams = session.teams.map((team) => {
            if (team.teamId === roundLostTeam) {
              team.score = team.score - 2;
            }
            return team;
          });
        } else if (
          roundLostTeam === "TEAM_BLACK" &&
          (session.currentActiveSlot === 1 || session.currentActiveSlot === 3)
        ) {
          session.teams = session.teams.map((team) => {
            if (team.teamId === roundLostTeam) {
              team.score = team.score - 2;
            }
            return team;
          });
        } else {
          // they did not chose the trick suit and lost the round so deduct 1 point from the team
          session.teams = session.teams.map((team) => {
            if (team.teamId === roundLostTeam) {
              team.score = team.score - 1;
            }
            return team;
          });
        }
        session.lastRoundTied = false;
      }

      // Update the session current active slot
      session.currentActiveSlot = ((session.currentActiveSlot + 1) % 4) as
        | 0
        | 1
        | 2
        | 3;

      // Broadcast round win and active slot to all players
      await broadcastToSession(
        {
          action: "ROUND_WON",
          body: {
            round: session.currentRound,
            activeSlot: session.currentActiveSlot,
            roundLostTeam,
            roundWonTeam,
            isRoundTied,
            teams: session.teams,
            sessionStatus: session.status,
          },
        },
        sessionId,
        webSocketEndpoint
      );
    }

    // Update all the records in DynamoDB using AWS recommended transactions
    try {
      const transaction = new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: roundsTable,
              Item: currentRound,
            },
          },
          {
            Put: {
              TableName: moveRecordsTable,
              Item: moveRecord,
            },
          },
          {
            Put: {
              TableName: sessionsTable,
              Item: session,
            },
          },
        ],
      });

      await docClient.send(transaction);
    } catch (dbError) {
      console.error("Database transaction failed:", dbError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          action: "PLAY_CARD",
          error: "Failed to update game state atomically",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        action: "PLAY_CARD",
        message: "Card played successfully",
      }),
    };
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        action: "PLAY_CARD",
        error: "The player does not have the card in his hand",
      }),
    };
  }
};
