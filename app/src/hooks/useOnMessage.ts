import { useSessionStore } from "../stores/sessionStore";
import { getSession } from "../services/session.service";
import { toast } from "sonner";
import { type PlayerCard, useRoundStore } from "../stores/roundStore";

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

export const useOnMessage = () => {
  const { setSession } = useSessionStore();
  const {
    setMyCardSet,
    setTrickSuit,
    setCurrentSlot,
    setIsSuitSelectorEnabled,
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

  return handleMessage;
};
