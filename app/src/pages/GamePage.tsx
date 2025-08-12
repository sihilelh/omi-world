import { useParams } from "react-router-dom";
import { NavBar } from "../components/molecules/NavBar";
import { useEffect } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { getSession } from "../services/session.service";
import {
  PlayerHand,
  Button,
  ConnectionStatus,
  GameScoreDisplay,
  GameTable,
  RoundSummary,
  GameEndedCard,
} from "../components";
import { useWebSocket } from "../hooks/useWebSocket";
import { useWebSocketStore } from "../stores/webSocket.store";
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
    status,
    players,
    teams,
    currentActiveSlot,
    currentRound,
    lastRoundTied,
    lastRoundWinner,
    winnerTeam,
    allRoundsWins,
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
      currentRound &&
      currentRound > 0
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
    players.find((player) => player.userId === user?.username)?.slot || 0;

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

  const GameComponent = () => {
    return (
      <>
        {/* Scores  */}
        <div className="absolute right-8 top-4">
          <GameScoreDisplay
            redScore={
              teams.find((team) => team.teamId === "TEAM_RED")?.score || 0
            }
            blackScore={
              teams.find((team) => team.teamId === "TEAM_BLACK")?.score || 0
            }
            moveWins={moveWins}
          />
        </div>

        <GameTable
          players={players}
          mySlot={mySlot}
          currentSlot={currentSlot}
          currentMoveCards={currentMoveCards}
          trickSuit={trickSuit || ""}
        />

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
          <ConnectionStatus status={wsConnectionStatus} onReconnect={connect} />
        </div>
        {/* Active session which users can join  */}
        {status && status === "waiting" && (
          <SessionWaitCard startGame={() => send("GAME_START")} />
        )}

        {/* Select Trick Suit  */}
        {status &&
          status === "active:select_trick_suit" &&
          currentActiveSlot !== null &&
          currentActiveSlot !== mySlot && (
            <div className="text-center text-2xl font-bold">
              Wait till{" "}
              {players.find((player) => player.slot === currentActiveSlot)
                ?.userId || "other player"}{" "}
              to select the trick suit
            </div>
          )}

        {/* Running session which users can play  */}
        {status && status === "active:game_play" && trickSuit && (
          <GameComponent />
        )}

        {status &&
          status === "active" &&
          currentActiveSlot !== null &&
          currentActiveSlot === mySlot && (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-center text-2xl font-bold">
                Start the round
              </div>
              <Button onClick={() => send("ROUND_START")}>Start Round</Button>
            </div>
          )}

        {status &&
          status === "active" &&
          currentActiveSlot !== null &&
          currentActiveSlot !== mySlot && (
            <div className="flex flex-col items-center justify-center gap-4">
              Wait till the round starts.
            </div>
          )}

        {/* After a round ended, show the round summary modal  */}
        {status && status === "active:round_ended" && (
          <RoundSummary
            lastRoundTied={lastRoundTied || false}
            lastRoundWinner={lastRoundWinner || undefined}
            currentActiveSlot={currentActiveSlot}
            mySlot={mySlot}
            players={players}
            onStartNextRound={() => send("ROUND_START")}
          />
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

        {status && status === "active:game_ended" && (
          <GameEndedCard
            winnerTeam={winnerTeam}
            allRoundsWins={allRoundsWins}
          />
        )}
      </main>
    </>
  );
};
