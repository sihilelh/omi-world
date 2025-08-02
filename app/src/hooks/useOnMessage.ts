import { useSessionStore } from "../stores/sessionStore";
import { getSession } from "../services/session.service";
import { toast } from "sonner";
import { type PlayerCard, useRoundStore } from "../stores/roundStore";
import { getCardDataByNumber } from "../utils/playCard";
import type { SuitTypeValue } from "../components/atoms/SuitOutline";

interface UserJoinedBody {
  userId: string;
  team: "TEAM_2" | "TEAM_1"; // 1 = RED, 2 = BLACK
  sessionId: string;
}

interface GameStartedBody {
  sessionId: string;
  startedBy: string;
  timestamp: string;
}

interface ReceiveCardSetBody {
  roundId: string;
  sessionId: string;
  playerSlot: number;
  cards: PlayerCard[];
  isFirstSet: boolean;
  timestamp: string;
}

interface TrickSuitSelectedBody {
  roundId: string;
  sessionId: string;
  trickSuit: string;
  selectedBySlot: number;
  timestamp: string;
}

interface CardPlayedBody {
  card: number;
  slot: number;
  currentMove: number;
  isFirstMove?: boolean;
  isLastMove?: boolean;
}

interface MoveWonBody {
  move: number;
  wonBy: "TEAM_RED" | "TEAM_BLACK";
  wonBySlot: number;
}

interface RoundWonBody {
  round: number;
  activeSlot: number;
  roundLostTeam: "TEAM_RED" | "TEAM_BLACK" | null;
  isRoundTied: boolean;
}

export const useOnMessage = () => {
  const { setSession } = useSessionStore();
  const {
    setMyCardSet,
    setTrickSuit,
    setCurrentSlot,
    setIsSuitSelectorEnabled,
    setCurrentMove,
    setCurrentSuit,
    setMoveActiveSlot,
    addCardToMove,
    clearMoveCards,
    setMoveWins,
  } = useRoundStore();

  const handleMessage = (ws: WebSocket, event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const action = data.action;
    const body = data.body;
    switch (action) {
      case "health":
        console.log("WS:HEALTH", body);
        break;
      case "USER_JOINED":
        handleUserJoined(body);
        break;
      case "GAME_STARTED":
        handleGameStarted(body);
        break;
      case "GAME_START_SUCCESS":
        handleStartRound(ws);
        break;
      case "RECEIVE_CARD_SET":
        handleReceiveCardSet(body);
        break;
      case "TRICK_SUIT_SELECTED":
        handleTrickSuitSelected(body);
        break;
      case "CARD_PLAYED":
        handleCardPlayed(body);
        break;
      case "MOVE_WON":
        handleMoveWon(body);
        break;
      case "ROUND_WON":
        handleRoundWon(body);
        break;

      default:
        console.warn(`WS:UNKNOWN_ACTION(${action})`, body);
        break;
    }
  };

  const handleUserJoined = async (body: UserJoinedBody) => {
    try {
      const { userId, team, sessionId } = body;
      const session = await getSession(sessionId);
      if (session) {
        setSession(sessionId, session.sessionData);
      }
      toast.success(
        `${userId} joined to ${team === "TEAM_2" ? "black" : "red"} team`
      );
    } catch (error) {
      toast.error("User joined but something went wrong");
      console.error("WS:ERROR_USER_JOINED", error);
    }
  };

  const handleGameStarted = async (body: GameStartedBody) => {
    try {
      const { sessionId, startedBy } = body;
      const session = await getSession(sessionId);
      if (session) {
        setSession(sessionId, session.sessionData);
      }
      toast.success(`Game started by ${startedBy}`);
    } catch (error) {
      toast.error("Game started but something went wrong");
    }
  };

  const handleStartRound = async (ws: WebSocket) => {
    try {
      ws.send(
        JSON.stringify({
          action: "ROUND_START",
          body: {},
        })
      );
    } catch (error) {
      console.log("WS:ERROR_START_ROUND", error);
    }
  };

  const handleReceiveCardSet = async (body: ReceiveCardSetBody) => {
    try {
      const { isFirstSet } = body;
      setMyCardSet(body.cards);
      if (isFirstSet) {
        setIsSuitSelectorEnabled(true);
      }
    } catch (error) {
      console.log("WS:ERROR_RECEIVE_CARD_SET", error);
    }
  };

  const handleTrickSuitSelected = async (body: TrickSuitSelectedBody) => {
    try {
      const { trickSuit } = body;
      setTrickSuit(trickSuit);
      setCurrentSlot(body.selectedBySlot);
    } catch (error) {
      console.log("WS:ERROR_TRICK_SUIT_SELECTED", error);
    }
  };

  const handleCardPlayed = async (body: CardPlayedBody) => {
    try {
      const { card, slot, currentMove, isFirstMove, isLastMove } = body;
      setCurrentMove(currentMove);
      // Add card to current move
      addCardToMove(slot, card);
      // Update current slot to next player if it's not the last move
      if (!isLastMove) {
        setCurrentSlot((slot + 1) % 4);
      }
      // Set card suit if it's the first move
      if (isFirstMove) {
        setCurrentSuit(getCardDataByNumber(card).suit as SuitTypeValue);
      }
    } catch (error) {
      console.log("WS:ERROR_CARD_PLAYED", error);
    }
  };

  const handleMoveWon = async (body: MoveWonBody) => {
    try {
      const { move, wonBy, wonBySlot } = body;
      setCurrentMove(move);
      // Update move wins
      setMoveWins((prev) => ({
        ...prev,
        [wonBy]: prev[wonBy] + 1,
      }));
      // Update current slot to the winning slot (next move active slot)
      setCurrentSlot(wonBySlot);
      // Clear current move cards
      clearMoveCards();
      // Update current slot to the winning slot (next move active slot)
      // This will be handled by the backend logic
      console.log(`Move ${move} won by ${wonBy}`);
    } catch (error) {
      console.log("WS:ERROR_MOVE_WON", error);
    }
  };

  const handleRoundWon = async (body: RoundWonBody) => {
    try {
      const { round, activeSlot, roundLostTeam, isRoundTied } = body;
      // Update move active slot
      setMoveActiveSlot(activeSlot);
      // Clear move cards and reset move wins for new round
      clearMoveCards();
      setMoveWins({ TEAM_RED: 0, TEAM_BLACK: 0 });
      // Update session with new active slot and round info
      // The session store will be updated by the backend
      console.log(
        `Round ${round} completed. Active slot: ${activeSlot}, Lost team: ${roundLostTeam}, Tied: ${isRoundTied}`
      );
    } catch (error) {
      console.log("WS:ERROR_ROUND_WON", error);
    }
  };

  return handleMessage;
};
