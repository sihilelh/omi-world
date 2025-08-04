import { getRound } from "../services/round.service";
import { useRoundStore } from "../stores/roundStore";
import { useSessionStore } from "../stores/sessionStore";
import { useCallback } from "react";
import type { SuitTypeValue } from "../components/atoms/SuitOutline";

export const useGameRound = () => {
  const {
    setCurrentSlot,
    setCurrentSuit,
    setMyCardSet,
    setTrickSuit,
    setCurrentMove,
    setIsSuitSelectorEnabled,
    setMoveActiveSlot,
    setCurrentMoveCards,
    setMoveWins,
  } = useRoundStore();
  const { sessionId, status, currentRound } = useSessionStore();

  const handlePageRefreshRestore = useCallback(async () => {
    if (!sessionId || !currentRound || currentRound === 0) {
      return;
    }

    try {
      const roundId = `${sessionId}_round_${currentRound}`;
      const roundData = await getRound(roundId);

      if (roundData) {
        // Restore round state
        setCurrentSlot(roundData.moveCurrentSlot || 0); // Use moveCurrentSlot from backend
        setCurrentSuit(
          (roundData.currentSuit as "ALL" | SuitTypeValue) || "ALL"
        );
        setTrickSuit(roundData.trickSuit || "");
        setCurrentMove(roundData.currentMove || 1);
        setMoveActiveSlot(roundData.moveActiveSlot || 0);
        setCurrentMoveCards(roundData.currentMoveCards || []);
        setMoveWins(roundData.moveWins || { TEAM_RED: 0, TEAM_BLACK: 0 });

        // Restore cards based on round status
        if (status === "active:game_play") {
          // Full 8 cards after trick suit is selected
          setMyCardSet(roundData.userCards || []);
          setIsSuitSelectorEnabled(false); // Trick suit already selected
        } else if (status === "active:select_trick_suit") {
          // First 4 cards for active player, no cards for others
          setMyCardSet(roundData.userCards || []);
          // Enable suit selector if user has 4 cards and is the active slot
          if (
            roundData.userCards.length === 4 &&
            roundData.userSlot === roundData.moveActiveSlot
          ) {
            setIsSuitSelectorEnabled(true);
          } else {
            setIsSuitSelectorEnabled(false);
          }
        } else {
          // Clear cards for other statuses
          setMyCardSet([]);
          setIsSuitSelectorEnabled(false);
        }
      }
    } catch (error) {
      console.error("Failed to restore round data:", error);
    }
  }, [
    sessionId,
    status,
    currentRound,
    setMyCardSet,
    setCurrentSlot,
    setCurrentSuit,
    setTrickSuit,
    setCurrentMove,
    setMoveActiveSlot,
    setCurrentMoveCards,
    setMoveWins,
  ]);

  // Add a separate function for page refresh restoration that doesn't interfere with active gameplay
  const handlePageRefreshOnly = useCallback(async () => {
    if (!sessionId || !currentRound || currentRound === 0) {
      return;
    }

    try {
      const roundId = `${sessionId}_round_${currentRound}`;
      const roundData = await getRound(roundId);

      if (roundData) {
        // Only restore if we don't have cards yet (indicating a fresh page load)
        const { myCardSet } = useRoundStore.getState();
        if (myCardSet.length > 0) {
          // Don't restore if we already have cards (active gameplay)
          return;
        }

        // Restore round state
        setCurrentSlot(roundData.moveCurrentSlot || 0);
        setCurrentSuit(
          (roundData.currentSuit as "ALL" | SuitTypeValue) || "ALL"
        );
        setTrickSuit(roundData.trickSuit || "");
        setCurrentMove(roundData.currentMove || 1);
        setMoveActiveSlot(roundData.moveActiveSlot || 0);
        setCurrentMoveCards(roundData.currentMoveCards || []);
        setMoveWins(roundData.moveWins || { TEAM_RED: 0, TEAM_BLACK: 0 });

        // Restore cards based on round status
        if (status === "active:game_play") {
          setMyCardSet(roundData.userCards || []);
          setIsSuitSelectorEnabled(false);
        } else if (status === "active:select_trick_suit") {
          setMyCardSet(roundData.userCards || []);
          if (
            roundData.userCards.length === 4 &&
            roundData.userSlot === roundData.moveActiveSlot
          ) {
            setIsSuitSelectorEnabled(true);
          } else {
            setIsSuitSelectorEnabled(false);
          }
        } else {
          setMyCardSet([]);
          setIsSuitSelectorEnabled(false);
        }
      }
    } catch (error) {
      console.error("Failed to restore round data:", error);
    }
  }, [
    sessionId,
    status,
    currentRound,
    setMyCardSet,
    setCurrentSlot,
    setCurrentSuit,
    setTrickSuit,
    setCurrentMove,
    setMoveActiveSlot,
    setCurrentMoveCards,
    setMoveWins,
  ]);

  return { handlePageRefreshRestore, handlePageRefreshOnly };
};
