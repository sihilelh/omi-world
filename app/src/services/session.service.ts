import { toast } from "sonner";
import { api } from "../utils/api";

export interface Player {
  userId: string;
  team: string;
}

export interface Team {
  teamId: string;
  score: number;
}

export interface CreateSessionResponse {
  message: string;
  sessionId: string;
  sessionData: {
    pk: string;
    createdAt: string;
    status: string;
    createdUser: string;
    currentActiveUser: string;
    currentRound: number;
    teams: Array<Team>;
    players: Array<Player>;
  };
}

export const createSession = async () => {
  try {
    const response = await api.post("/sessions");
    return response.data as CreateSessionResponse;
  } catch (error) {
    toast.error("Failed to create session");
  }
};

export const joinSession = async (sessionId: string) => {
  try {
    const response = await api.put(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    toast.error("Failed to join session");
  }
};
