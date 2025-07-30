import { create } from "zustand";

export type WebSocketConnectionStatus =
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED";

interface WebSocketStoreState {
  ws: WebSocket | null;
  wsConnectionStatus: WebSocketConnectionStatus;
  setWs: (ws: WebSocket | null) => void;
  setWsConnectionStatus: (status: WebSocketConnectionStatus) => void;
}

export const useWebSocketStore = create<WebSocketStoreState>((set) => ({
  ws: null,
  wsConnectionStatus: "DISCONNECTED",
  setWs: (ws) => {
    console.info("Setting WebSocket to:", ws);
    return set({ ws });
  },
  setWsConnectionStatus: (status) => {
    console.info("Setting WebSocket connection status to:", status);
    return set({ wsConnectionStatus: status });
  },
}));
