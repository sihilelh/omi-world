import { create } from "zustand";
import type { SuitTypeValue } from "../components/atoms/SuitOutline";

export interface PlayerCard {
  number: number;
  suit: string;
  card: string;
}

interface RoundState {
  myCardSet: PlayerCard[];
  isSuitSelectorEnabled: boolean;
  trickSuit: string | null;
  currentSlot: number;
  currentSuit: SuitTypeValue | "ALL";
  currentMove: number;
  moveActiveSlot: number;
  currentMoveCards: { slot: number; card: number }[];
  moveWins: {
    TEAM_RED: number;
    TEAM_BLACK: number;
  };
  setTrickSuit: (trickSuit: string) => void;
  setCurrentSlot: (currentSlot: number) => void;
  setIsSuitSelectorEnabled: (isSuitSelectorEnabled: boolean) => void;
  setMyCardSet: (myCardSet: PlayerCard[]) => void;
  setCurrentSuit: (currentSuit: SuitTypeValue | "ALL") => void;
  setCurrentMove: (currentMove: number) => void;
  setMoveActiveSlot: (moveActiveSlot: number) => void;
  setCurrentMoveCards: (currentMoveCards: { slot: number; card: number }[]) => void;
  setMoveWins: (moveWins: { TEAM_RED: number; TEAM_BLACK: number } | ((prev: { TEAM_RED: number; TEAM_BLACK: number }) => { TEAM_RED: number; TEAM_BLACK: number })) => void;
  addCardToMove: (slot: number, card: number) => void;
  clearMoveCards: () => void;
}

export const useRoundStore = create<RoundState>((set) => ({
  isSuitSelectorEnabled: false,
  myCardSet: [],
  trickSuit: null,
  currentSlot: 0,
  currentSuit: "ALL",
  currentMove: 1,
  moveActiveSlot: 0,
  currentMoveCards: [],
  moveWins: {
    TEAM_RED: 0,
    TEAM_BLACK: 0,
  },
  setCurrentSuit: (currentSuit) => set({ currentSuit }),
  setTrickSuit: (trickSuit) => set({ trickSuit }),
  setCurrentSlot: (currentSlot) => set({ currentSlot }),
  setIsSuitSelectorEnabled: (isSuitSelectorEnabled) =>
    set({ isSuitSelectorEnabled }),
  setMyCardSet: (myCardSet) => set({ myCardSet }),
  setCurrentMove: (currentMove) => set({ currentMove }),
  setMoveActiveSlot: (moveActiveSlot) => set({ moveActiveSlot }),
  setCurrentMoveCards: (currentMoveCards) => set({ currentMoveCards }),
  setMoveWins: (moveWins) => set((state) => ({ 
    moveWins: typeof moveWins === 'function' ? moveWins(state.moveWins) : moveWins 
  })),
  addCardToMove: (slot, card) =>
    set((state) => ({
      currentMoveCards: [...state.currentMoveCards, { slot, card }],
    })),
  clearMoveCards: () => set({ currentMoveCards: [] }),
}));
