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
        setCurrentSlot(roundData.moveCurrentSlot || 0); // Use moveCurrentSlot from backend
        setCurrentSuit((roundData.currentSuit as "ALL" | SuitTypeValue) || "ALL");
        setTrickSuit(roundData.trickSuit || "");
        setCurrentMove(roundData.currentMove || 1);
        setMoveActiveSlot(roundData.moveActiveSlot || 0);
        setCurrentMoveCards(roundData.currentMoveCards || []);
        setMoveWins(roundData.moveWins || { TEAM_RED: 0, TEAM_BLACK: 0 });

        // Restore cards based on round status
        if (roundData.status === "active") {
          // Full 8 cards after trick suit is selected
          setMyCardSet(roundData.userCards || []);
          setIsSuitSelectorEnabled(false); // Trick suit already selected
        } else if (roundData.status === "waiting_for_trick_suit") {
          // First 4 cards for active player, no cards for others
          setMyCardSet(roundData.userCards || []);
          // Enable suit selector if user has 4 cards and is the active slot
          if (roundData.userCards.length === 4 && roundData.userSlot === roundData.moveActiveSlot) {
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
    sessionData,
    setMyCardSet,
    setCurrentSlot,
    setCurrentSuit,
    setTrickSuit,
    setCurrentMove,
    setMoveActiveSlot,
    setCurrentMoveCards,
    setMoveWins,
  ]);

  return { handlePageRefreshRestore };
};
