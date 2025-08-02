import { useParams } from "react-router-dom";
import { NavBar } from "../components/molecules/NavBar";
import { useEffect } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { getSession } from "../services/session.service";
import { CardTable, ScoreDisplay, PlayerInfo, PlayerHand } from "../components";
import { PlayCard } from "../components/atoms/PlayCard";
import {
  SuitOutline,
  type SuitTypeValue,
} from "../components/atoms/SuitOutline";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebSocketStore } from "../stores/webSocket.store";
import { RotateCcw } from "lucide-react";
import { SessionWaitCard } from "../components/molecules/SessionWaitCard";
import { useRoundStore } from "../stores/roundStore";
import { TrickSuitSelect } from "../components/molecules/TrickSuitSelect";
import {
  getCardDataByNumber,
  getCardNameByNumber,
  getCardNumberByName,
} from "../utils/playCard";
import { useAuth } from "../hooks/useAuth";
import { useGameRound } from "../hooks/useGameRound";

export const GamePage = () => {
  const { sessionId } = useParams();
  const { setSession, sessionData } = useSessionStore();
  const { user } = useAuth();
  const { wsConnectionStatus } = useWebSocketStore();
  const { connect, send } = useWebSocket(sessionId);
  const {
    isSuitSelectorEnabled,
    myCardSet,
    setIsSuitSelectorEnabled,
    currentSlot,
    currentSuit,
    setMyCardSet,
  } = useRoundStore();
  const { handlePageRefreshRestore } = useGameRound();
  const { currentMoveCards, trickSuit } = useRoundStore();

  useEffect(() => {
    fetchSessionData();
  }, [sessionId, setSession]);

  useEffect(() => {
    if (
      sessionData &&
      sessionData.status === "active" &&
      sessionData.currentRound > 0
    ) {
      handlePageRefreshRestore();
    }
  }, [sessionData?.currentRound, handlePageRefreshRestore]);

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

  const mySlot =
    sessionData?.players.find((player) => player.userId === user?.username)
      ?.slot || 0;

  const topPlayer = sessionData?.players.find(
    (player) => player.slot === (mySlot + 2) % 4
  );
  const leftPlayer = sessionData?.players.find(
    (player) => player.slot === (mySlot + 3) % 4
  );
  const rightPlayer = sessionData?.players.find(
    (player) => player.slot === (mySlot + 1) % 4
  );

  const canIPlayTheCard = (cardNumber: number) => {
    const { suit } = getCardDataByNumber(cardNumber);
    if (currentSlot !== mySlot) return false;
    if (currentSuit === "ALL") return true;
    if (suit === currentSuit) return true;
    const doIHaveCurrentSuitCards = myCardSet.some(
      (c) => getCardDataByNumber(c.number).suit === currentSuit
    );
    if (doIHaveCurrentSuitCards === false) {
      return true;
    }
    return false;
  };

  const PlayerTurnIndicator = () => {
    return (
      <div className="w-5 h-5 rounded-full bg-radial from-amber-300 to-amber-500 border-2 border-amber-200" />
    );
  };

  const GameComponent = () => {
    return (
      <>
        {/* Scores  */}
        <div className="absolute right-8 top-4">
          <ScoreDisplay
            redScore={
              sessionData?.teams.find((team) => team.teamId === "TEAM_RED")
                ?.score || 0
            }
            blackScore={
              sessionData?.teams.find((team) => team.teamId === "TEAM_BLACK")
                ?.score || 0
            }
          />
        </div>

        {/* Other Players  */}
        {/* Top Player  */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <PlayerInfo
            name={topPlayer?.userId || "Unknown"}
            cardCount={8}
            teamColor={topPlayer?.team === "TEAM_RED" ? "red" : "black"}
            position="top"
          />
        </div>

        {/* Left Player  */}
        <div className="absolute top-1/2 left-8 -translate-y-1/2">
          <PlayerInfo
            name={leftPlayer?.userId || "Unknown"}
            cardCount={8}
            teamColor={leftPlayer?.team === "TEAM_RED" ? "red" : "black"}
            position="left"
          />
        </div>

        {/* Right Player  */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2">
          <PlayerInfo
            name={rightPlayer?.userId || "Unknown"}
            cardCount={8}
            teamColor={rightPlayer?.team === "TEAM_RED" ? "red" : "black"}
            position="right"
          />
        </div>

        <CardTable>
          <div className="w-full h-full relative">
            {/* Top Players Table Card  */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
              {currentMoveCards
                .filter((card) => card.slot === topPlayer?.slot)
                .map((card) => (
                  <PlayCard
                    cardType={getCardNameByNumber(card.card)}
                    size="sm"
                  />
                ))}
              {topPlayer?.slot === currentSlot && <PlayerTurnIndicator />}
            </div>

            {/* Right Players Table Card  */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              {currentMoveCards
                .filter((card) => card.slot === rightPlayer?.slot)
                .map((card) => (
                  <PlayCard
                    cardType={getCardNameByNumber(card.card)}
                    size="sm"
                  />
                ))}
              {rightPlayer?.slot === currentSlot && <PlayerTurnIndicator />}
            </div>

            {/* Left Players Table Card  */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2">
              {currentMoveCards
                .filter((card) => card.slot === leftPlayer?.slot)
                .map((card) => (
                  <PlayCard
                    cardType={getCardNameByNumber(card.card)}
                    size="sm"
                  />
                ))}
              {leftPlayer?.slot === currentSlot && <PlayerTurnIndicator />}
            </div>

            {/* Bottom Players Table Card  */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
              {currentMoveCards
                .filter((card) => card.slot === mySlot)
                .map((card) => (
                  <PlayCard
                    cardType={getCardNameByNumber(card.card)}
                    size="sm"
                  />
                ))}
              {mySlot === currentSlot && <PlayerTurnIndicator />}
            </div>

            {/* This Round's Selected Suit  */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <SuitOutline suitType={trickSuit as SuitTypeValue} />
            </div>
          </div>
        </CardTable>

        <div className="absolute bottom-4">
          <PlayerHand
            cards={myCardSet.map((card) => ({
              cardType: getCardNameByNumber(card.number),
              disabled: !canIPlayTheCard(card.number),
            }))}
            onCardClick={(cardType) => {
              console.log("Card clicked:", cardType);
              const cardNumber = getCardNumberByName(cardType);

              // Remove the card from my card set
              setMyCardSet(myCardSet.filter((c) => c.number !== cardNumber));

              // Handle card selection logic here
              send("PLAY_CARD", {
                playedCard: cardNumber,
              });
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
        {sessionData &&
          sessionData.status === "active" &&
          !isSuitSelectorEnabled && <GameComponent />}

        {/* After a round ended, show the round summary modal  */}
        {sessionData && sessionData.status === "active:round_ended" && (
          <div>
            <div>Round Summary</div>
            <div>Round Summary</div>
          </div>
        )}

        {isSuitSelectorEnabled && (
          <TrickSuitSelect
            myCardSet={myCardSet}
            onSuitClick={(suit) => {
              setIsSuitSelectorEnabled(false);
              send("TRICK_SUIT_SELECT", {
                trickSuit: suit,
              });
            }}
          />
        )}
      </main>
    </>
  );
};
