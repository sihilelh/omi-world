import { toast } from "sonner";
import { api } from "../utils/api";

export interface RoundCard {
  number: number;
  suit: string;
  card: string;
}

export interface RoundMoveWins {
  TEAM_BLACK: number;
  TEAM_RED: number;
}

export interface RoundData {
  roundId: string;
  sessionId: string;
  userCards: RoundCard[];
  userSlot: number;
  currentSlot: number;
  currentSuit: string;
  trickSuit: string | null;
  moveWins: RoundMoveWins;
  moveCurrentSlot: number;
  status: string;
  createdAt: string;
  moveActiveSlot: number;
  currentMove: number;
  seed: number;
  pk: string;
  currentMoveCards: { slot: 0 | 1 | 2 | 3; card: number }[];
}

export const getRound = async (roundId: string) => {
  try {
    const response = await api.get(`/rounds/${roundId}`);
    return response.data as RoundData;
  } catch (error) {
    toast.error("Failed to get round");
    throw error;
  }
};
