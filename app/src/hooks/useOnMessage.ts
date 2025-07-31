import { useSessionStore } from "../stores/sessionStore";
import { getSession } from "../services/session.service";
import { toast } from "sonner";

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

export const useOnMessage = () => {
  const { setSession } = useSessionStore();

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
  return handleMessage;
};
