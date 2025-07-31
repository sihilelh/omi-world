import { useParams } from "react-router-dom";
import { NavBar } from "../components/molecules/NavBar";
import { useEffect } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { getSession } from "../services/session.service";
import { CardTable, ScoreDisplay, PlayerInfo, PlayerHand } from "../components";
import { PlayCard } from "../components/atoms/PlayCard";
import { SuitOutline } from "../components/atoms/SuitOutline";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebSocketStore } from "../stores/webSocket.store";
import { RotateCcw } from "lucide-react";
import { SessionWaitCard } from "../components/molecules/SessionWaitCard";

export const GamePage = () => {
  const { sessionId } = useParams();
  const { setSession, sessionData } = useSessionStore();
  const { wsConnectionStatus } = useWebSocketStore();
  const { connect, send } = useWebSocket(sessionId);

  useEffect(() => {
    fetchSessionData();
  }, [sessionId, setSession]);

  const fetchSessionData = async () => {
    // If sessionId is present in the URL, fetch and store session data
    if (sessionId) {
      getSession(sessionId).then((data) => {
        if (data && data.sessionData) {
          setSession(sessionId, data.sessionData);
        }
      });
    }
  };

  const GameComponent = () => {
    return (
      <>
        {/* Scores  */}
        <div className="absolute right-8 top-4">
          <ScoreDisplay redScore={10} blackScore={10} />
        </div>

        {/* Other Players  */}
        {/* Top Player  */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <PlayerInfo
            name="sihilelh"
            cardCount={8}
            teamColor="red"
            position="top"
          />
        </div>

        {/* Left Player  */}
        <div className="absolute top-1/2 left-8 -translate-y-1/2">
          <PlayerInfo
            name="jhon"
            cardCount={8}
            teamColor="black"
            position="left"
          />
        </div>

        {/* Right Player  */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2">
          <PlayerInfo
            name="jane"
            cardCount={8}
            teamColor="black"
            position="right"
          />
        </div>

        <CardTable>
          <div className="w-full h-full relative">
            {/* Top Players Table Card  */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
              <PlayCard cardType="CLUBS_8" size="sm" />
            </div>

            {/* Right Players Table Card  */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <PlayCard
                cardType="CLUBS_7"
                size="sm"
                onClick={() => {
                  send("health");
                }}
              />
            </div>

            {/* Left Players Table Card  */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2">
              <PlayCard cardType="CLUBS_7" size="sm" />
            </div>

            {/* Bottom Players Table Card  */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              <PlayCard cardType="CLUBS_7" size="sm" />
            </div>

            {/* This Round's Selected Suit  */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <SuitOutline suitType="CLUBS" />
            </div>
          </div>
        </CardTable>

        <div className="absolute bottom-4">
          <PlayerHand
            cards={[
              { cardType: "CLUBS_QUEEN", disabled: true },
              { cardType: "HEARTS_10" },
              { cardType: "SPADES_ACE" },
              { cardType: "DIAMONDS_9" },
              { cardType: "CLUBS_7" },
              { cardType: "HEARTS_KING" },
              { cardType: "SPADES_9" },
              { cardType: "DIAMONDS_JACK" },
            ]}
            onCardClick={(cardType) => {
              console.log("Card clicked:", cardType);
              // Handle card selection logic here
            }}
            className="flex items-center justify-center gap-4"
          />
        </div>
      </>
    );
  };

  return (
    <>
      <NavBar />
      <main className="h-[calc(100vh-5rem)] mt-20 relative flex items-center justify-center">
        {/* Connection Status  */}
        <div className="absolute left-8 top-4">
          {wsConnectionStatus === "DISCONNECTED" && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full border border-white"></div>
              <p className="text-xs text-red-100">Disconnected</p>
              <button
                title="Try Again!"
                onClick={connect}
                className="text-red-100 cursor-pointer"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          )}
          {wsConnectionStatus === "CONNECTED" && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
              <p className="text-xs text-green-100">Connected</p>
            </div>
          )}
          {wsConnectionStatus === "CONNECTING" && (
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-neutral-500 rounded-full border border-white"></div>
              <p className="text-xs text-neutral-100">
                Connecting to server ...
              </p>
            </div>
          )}
        </div>
        {/* Active session which users can join  */}
        {sessionData && sessionData.status === "waiting" && (
          <SessionWaitCard startGame={() => send("GAME_START")} />
        )}

        {/* Running session which users can play  */}
        {sessionData && sessionData.status === "active" && <GameComponent />}
      </main>
    </>
  );
};
