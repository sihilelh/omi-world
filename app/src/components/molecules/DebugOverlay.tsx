import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useSessionStore } from "../../stores/sessionStore";
import { useRoundStore } from "../../stores/roundStore";
import { useWebSocketStore } from "../../stores/webSocket.store";

export const DebugOverlay = () => {
  const [searchParams] = useSearchParams();
  const debug = searchParams.get("debug");

  // Local state for expand/collapse
  const [expandedSections, setExpandedSections] = useState({
    session: true,
    round: true,
    websocket: true,
  });

  // Get store data
  const sessionStore = useSessionStore();
  const roundStore = useRoundStore();
  const webSocketStore = useWebSocketStore();

  if (!debug) {
    return null;
  }

  const formatValue = (value: any): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="absolute top-0 left-0 bg-black/80 text-white z-50 p-4 max-w-2xl max-h-screen overflow-auto font-mono text-xs">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2 text-yellow-400">
          Debug Overlay
        </h2>
      </div>

      {/* Session Store */}
      <div className="mb-4 border border-gray-600 rounded p-2">
        <button
          onClick={() => toggleSection("session")}
          className="flex items-center justify-between w-full text-left text-sm font-bold text-blue-400 mb-2 hover:bg-gray-700 px-2 py-1 rounded"
        >
          <span>Session Store</span>
          <span>{expandedSections.session ? "▼" : "▶"}</span>
        </button>
        {expandedSections.session && (
          <div className="space-y-1">
            <div>
              <span className="text-gray-400">sessionId:</span>{" "}
              <span className="text-green-400">
                {formatValue(sessionStore.sessionId)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">status:</span>{" "}
              <span className="text-green-400">
                {formatValue(sessionStore.status)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">createdAt:</span>{" "}
              <span className="text-green-400">
                {formatValue(sessionStore.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">createdUser:</span>{" "}
              <span className="text-green-400">
                {formatValue(sessionStore.createdUser)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">currentActiveSlot:</span>{" "}
              <span className="text-green-400">
                {formatValue(sessionStore.currentActiveSlot)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">currentRound:</span>{" "}
              <span className="text-green-400">
                {formatValue(sessionStore.currentRound)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">players:</span>{" "}
              <pre className="text-green-400 whitespace-pre-wrap">
                {formatValue(sessionStore.players)}
              </pre>
            </div>
            <div>
              <span className="text-gray-400">teams:</span>{" "}
              <pre className="text-green-400 whitespace-pre-wrap">
                {formatValue(sessionStore.teams)}
              </pre>
            </div>
            <div>
              <span className="text-gray-400">lastRoundTied:</span>{" "}
              <span className="text-green-400">
                {formatValue(sessionStore.lastRoundTied)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">lastRoundWinner:</span>{" "}
              <span className="text-green-400">
                {formatValue(sessionStore.lastRoundWinner)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">sessionData (computed):</span>{" "}
              <pre className="text-green-400 whitespace-pre-wrap">
                {formatValue(sessionStore.sessionData)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Round Store */}
      <div className="mb-4 border border-gray-600 rounded p-2">
        <button
          onClick={() => toggleSection("round")}
          className="flex items-center justify-between w-full text-left text-sm font-bold text-purple-400 mb-2 hover:bg-gray-700 px-2 py-1 rounded"
        >
          <span>Round Store</span>
          <span>{expandedSections.round ? "▼" : "▶"}</span>
        </button>
        {expandedSections.round && (
          <div className="space-y-1">
            <div>
              <span className="text-gray-400">isSuitSelectorEnabled:</span>{" "}
              <span className="text-green-400">
                {formatValue(roundStore.isSuitSelectorEnabled)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">trickSuit:</span>{" "}
              <span className="text-green-400">
                {formatValue(roundStore.trickSuit)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">currentSlot:</span>{" "}
              <span className="text-green-400">
                {formatValue(roundStore.currentSlot)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">currentSuit:</span>{" "}
              <span className="text-green-400">
                {formatValue(roundStore.currentSuit)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">currentMove:</span>{" "}
              <span className="text-green-400">
                {formatValue(roundStore.currentMove)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">moveActiveSlot:</span>{" "}
              <span className="text-green-400">
                {formatValue(roundStore.moveActiveSlot)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">moveWins:</span>{" "}
              <pre className="text-green-400 whitespace-pre-wrap">
                {formatValue(roundStore.moveWins)}
              </pre>
            </div>
            <div>
              <span className="text-gray-400">myCardSet:</span>{" "}
              <pre className="text-green-400 whitespace-pre-wrap">
                {formatValue(roundStore.myCardSet)}
              </pre>
            </div>
            <div>
              <span className="text-gray-400">currentMoveCards:</span>{" "}
              <pre className="text-green-400 whitespace-pre-wrap">
                {formatValue(roundStore.currentMoveCards)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* WebSocket Store */}
      <div className="mb-4 border border-gray-600 rounded p-2">
        <button
          onClick={() => toggleSection("websocket")}
          className="flex items-center justify-between w-full text-left text-sm font-bold text-orange-400 mb-2 hover:bg-gray-700 px-2 py-1 rounded"
        >
          <span>WebSocket Store</span>
          <span>{expandedSections.websocket ? "▼" : "▶"}</span>
        </button>
        {expandedSections.websocket && (
          <div className="space-y-1">
            <div>
              <span className="text-gray-400">wsConnectionStatus:</span>{" "}
              <span className="text-green-400">
                {formatValue(webSocketStore.wsConnectionStatus)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">ws:</span>{" "}
              <span className="text-green-400">
                {webSocketStore.ws ? "Connected" : "null"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
