import { getRound } from "../services/round.service";
import { useRoundStore } from "../stores/roundStore";
import { useSessionStore } from "../stores/sessionStore";
import { useCallback } from "react";

export const useGameRound = () => {
  const {
    setCurrentSlot,
    setCurrentSuit,
    setMyCardSet,
    setTrickSuit,
    setCurrentMove,
    setIsSuitSelectorEnabled,
  } = useRoundStore();
  const { sessionData } = useSessionStore();

  const handlePageRefreshRestore = useCallback(async () => {
    if (
      !sessionData ||
      sessionData.status !== "active" ||
      sessionData.currentRound === 0
    ) {
      return;
    }

    try {
      const roundId = `${sessionData.pk}_round_${sessionData.currentRound}`;
      const roundData = await getRound(roundId);

      if (roundData) {
        // Restore round state
        setCurrentSlot(roundData.currentSlot || 0);
        setCurrentSuit(roundData.currentSuit || "ALL");
        setTrickSuit(roundData.trickSuit || null);
        setCurrentMove(roundData.currentMove || 1);

        // Restore cards based on round status
        if (roundData.status === "active") {
          // Full 8 cards after trick suit is selected
          setMyCardSet(roundData.userCards || []);
        } else if (roundData.status === "waiting_for_trick_suit") {
          // First 4 cards for active player, no cards for others
          setMyCardSet(roundData.userCards || []);
          if (roundData.userCards.length === 4) {
            setIsSuitSelectorEnabled(true);
          }
        } else {
          // Clear cards for other statuses
          setMyCardSet([]);
        }
      }
    } catch (error) {
      console.error("Failed to restore round data:", error);
    }
  }, [
    sessionData,
    setMyCardSet,
    setCurrentSlot,
    setCurrentSuit,
    setTrickSuit,
    setCurrentMove,
  ]);

  return { handlePageRefreshRestore };
};
