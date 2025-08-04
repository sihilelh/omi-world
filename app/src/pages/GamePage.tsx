import { useParams } from "react-router-dom";
import { NavBar } from "../components/molecules/NavBar";
import { useEffect } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { getSession } from "../services/session.service";
import {
  CardTable,
  ScoreDisplay,
  PlayerInfo,
  PlayerHand,
  Button,
} from "../components";
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
import { DebugOverlay } from "../components/molecules/DebugOverlay";

export const GamePage = () => {
  const { sessionId } = useParams();
  const { 
    setSession, 
    sessionId: storeSessionId,
    status,
    players,
    teams,
    currentActiveSlot,
    currentRound,
    lastRoundTied,
    lastRoundWinner,
    createdUser
  } = useSessionStore();
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
  const { handlePageRefreshOnly } = useGameRound();
  const { currentMoveCards, trickSuit, moveWins } = useRoundStore();

  useEffect(() => {
    fetchSessionData();
  }, [sessionId, setSession]);

  useEffect(() => {
    if (
      status &&
      status.includes("active") &&
      currentRound && currentRound > 0
    ) {
      handlePageRefreshOnly();
    }
  }, [currentRound, handlePageRefreshOnly]);

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
    players.find((player) => player.userId === user?.username)
      ?.slot || 0;

  const topPlayer = players.find(
    (player) => player.slot === (mySlot + 2) % 4
  );
  const leftPlayer = players.find(
    (player) => player.slot === (mySlot + 3) % 4
  );
  const rightPlayer = players.find(
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
          <div className="flex flex-col items-end">
            <div className="w-max">
              <ScoreDisplay
                redScore={
                  teams.find((team) => team.teamId === "TEAM_RED")
                    ?.score || 0
                }
                blackScore={
                  teams.find(
                    (team) => team.teamId === "TEAM_BLACK"
                  )?.score || 0
                }
              />
            </div>
            {moveWins && moveWins.TEAM_RED >= 0 && moveWins.TEAM_BLACK >= 0 && (
              <div className="mt-4 flex flex-col items-end">
                <div className="text-lg font-bold">Move Wins</div>
                <div className="bg-neutral-200 rounded-full px-4 py-2 flex items-center gap-2 text-lg font-bold">
                  <span className="text-red-500">{moveWins.TEAM_RED}</span>{" "}
                  <span className="text-black">-</span>{" "}
                  <span className="text-black">{moveWins.TEAM_BLACK}</span>
                </div>
              </div>
            )}
          </div>
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
      <DebugOverlay />
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
        {status && status === "waiting" && (
          <SessionWaitCard startGame={() => send("GAME_START")} />
        )}

        {/* Select Trick Suit  */}
        {status &&
          status === "active:select_trick_suit" &&
          currentActiveSlot !== null && currentActiveSlot !== mySlot && (
            <div className="text-center text-2xl font-bold">
              Wait till{" "}
              {players.find(
                (player) => player.slot === currentActiveSlot
              )?.userId || "other player"}{" "}
              to select the trick suit
            </div>
          )}

        {/* Running session which users can play  */}
        {status &&
          status === "active:game_play" &&
          trickSuit && <GameComponent />}

        {status &&
          status === "active" &&
          currentActiveSlot !== null && currentActiveSlot === mySlot && (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-center text-2xl font-bold">
                Start the round
              </div>
              <Button onClick={() => send("ROUND_START")}>Start Round</Button>
            </div>
          )}

        {status &&
          status === "active" &&
          currentActiveSlot !== null && currentActiveSlot !== mySlot && (
            <div className="flex flex-col items-center justify-center gap-4">
              Wait till the round starts.
            </div>
          )}

        {/* After a round ended, show the round summary modal  */}
        {status && status === "active:round_ended" && (
          <div>
            <div className="text-center text-2xl font-bold mb-4">
              Round Summary
            </div>

            {lastRoundTied ? (
              <>
                <div className="text-center text-xl font-bold px-6 py-3 bg-gradient-to-r from-black to-red-900 rounded-full">
                  The round was tied
                </div>
              </>
            ) : (
              <>
                <div className="text-center text-xl font-bold px-6 py-3 bg-black rounded-full">
                  🎉 {lastRoundWinner} won the round
                </div>

                <div className="mt-4 text-xl text-center">
                  points deducted from{" "}
                  <span className="bg-red-500 px-2 rounded-full">
                    {lastRoundWinner === "TEAM_RED"
                      ? "team black"
                      : "team red"}
                  </span>
                  .
                </div>
              </>
            )}

            {currentActiveSlot !== null && currentActiveSlot === mySlot ? (
              <div className="mt-4 text-center">
                <Button onClick={() => send("ROUND_START")}>
                  Start Next Round
                </Button>
              </div>
            ) : (
              <div className="mt-4 text-center text-neutral-400">
                Wait till the next round starts by{" "}
                {players.find(
                  (player) => player.slot === currentActiveSlot
                )?.userId || "the other player"}
                .
              </div>
            )}
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
