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
  setTrickSuit: (trickSuit: string) => void;
  setCurrentSlot: (currentSlot: number) => void;
  setIsSuitSelectorEnabled: (isSuitSelectorEnabled: boolean) => void;
  setMyCardSet: (myCardSet: PlayerCard[]) => void;
  setCurrentSuit: (currentSuit: SuitTypeValue | "ALL") => void;
}

export const useRoundStore = create<RoundState>((set) => ({
  isSuitSelectorEnabled: false,
  myCardSet: [
    {
      number: 12,
      suit: "Hearts",
      card: "J",
    },
  ],
  trickSuit: null,
  currentSlot: 0,
  currentSuit: "ALL",
  setCurrentSuit: (currentSuit) => set({ currentSuit }),
  setTrickSuit: (trickSuit) => set({ trickSuit }),
  setCurrentSlot: (currentSlot) => set({ currentSlot }),
  setIsSuitSelectorEnabled: (isSuitSelectorEnabled) =>
    set({ isSuitSelectorEnabled }),
  setMyCardSet: (myCardSet) => set({ myCardSet }),
}));
