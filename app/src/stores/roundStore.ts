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
  setTrickSuit: (trickSuit: string) => void;
  setCurrentSlot: (currentSlot: number) => void;
  setIsSuitSelectorEnabled: (isSuitSelectorEnabled: boolean) => void;
  setMyCardSet: (myCardSet: PlayerCard[]) => void;
  setCurrentSuit: (currentSuit: SuitTypeValue | "ALL") => void;
  setCurrentMove: (currentMove: number) => void;
}

export const useRoundStore = create<RoundState>((set) => ({
  isSuitSelectorEnabled: false,
  myCardSet: [],
  trickSuit: null,
  currentSlot: 0,
  currentSuit: "ALL",
  currentMove: 1,
  setCurrentSuit: (currentSuit) => set({ currentSuit }),
  setTrickSuit: (trickSuit) => set({ trickSuit }),
  setCurrentSlot: (currentSlot) => set({ currentSlot }),
  setIsSuitSelectorEnabled: (isSuitSelectorEnabled) =>
    set({ isSuitSelectorEnabled }),
  setMyCardSet: (myCardSet) => set({ myCardSet }),
  setCurrentMove: (currentMove) => set({ currentMove }),
}));
