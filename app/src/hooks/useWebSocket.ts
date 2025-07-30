import { useEffect, useRef } from "react";
import { getCognitoToken } from "../utils/cognito";
import { useWebSocketStore } from "../stores/webSocket.store";
import { useOnMessage } from "./useOnMessage";

export const useWebSocket = (sessionId: string | undefined) => {
  const { ws, wsConnectionStatus, setWs, setWsConnectionStatus } =
    useWebSocketStore();
  const handleMessage = useOnMessage();
  const isConnectingRef = useRef(false);

  const buildWebSocketUrl = () => {
    const token = getCognitoToken();
    if (!token) {
      throw new Error("No token found");
    }
    if (!sessionId) {
      throw new Error("No sessionId found");
    }
    const urlParams = new URLSearchParams({
      token,
      sessionId,
    });
    return `${import.meta.env.VITE_WEBSOCKET_ENDPOINT}?${urlParams.toString()}`;
  };

  const connect = () => {
    if (ws || isConnectingRef.current || wsConnectionStatus === "CONNECTING") {
      console.info("WS:ALREADY_CONNECTED");
      return;
    }
    const url = buildWebSocketUrl();
    console.info(`WS:CONNECTING`, url);
    const wsConnection = new WebSocket(url);
    isConnectingRef.current = true;
    setWs(wsConnection);
    setWsConnectionStatus("CONNECTING");
    wsConnection.onopen = () => {
      setWsConnectionStatus("CONNECTED");
    };
    wsConnection.onclose = () => {
      setWsConnectionStatus("DISCONNECTED");
    };
    wsConnection.onerror = (error) => {
      console.error("WS:ERROR", error);
    };
    wsConnection.onmessage = (event) => {
      handleMessage(wsConnection, event);
    };
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      setWs(null);
      setWsConnectionStatus("DISCONNECTED");
    }
  };

  const send = (action: string, body?: Record<string, any>) => {
    if (!ws) {
      console.warn("WS:NOT_CONNECTED");
      return;
    }
    ws.send(JSON.stringify({ action, body: body || {} }));
  };

  // Connect to WebSocket when the component mounts and disconnect when the component unmounts
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, []);

  return { connect, disconnect, send };
};
