import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createSession, joinSession } from "../services/session.service";
import { useSessionStore } from "../stores/sessionStore";

interface GameSessionState {
  loading: boolean;
  error: string | null;
}

export const useGameSession = () => {
  const [state, setState] = useState<GameSessionState>({
    loading: false,
    error: null,
  });

  const navigate = useNavigate();
  const { setSession } = useSessionStore();

  const createGameSession = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await createSession();

      if (response) {
        setSession(response.sessionId, response.sessionData);
        setState((prev) => ({ ...prev, loading: false }));
        toast.success("Game session created successfully!");
        navigate(`/game/${response.sessionId}`);
        return { success: true, sessionId: response.sessionId };
      } else {
        setState((prev) => ({ ...prev, loading: false }));
        return { success: false };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create session";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const joinGameSession = async (sessionId: string, team?: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await joinSession(sessionId, team);

      if (response) {
        setSession(sessionId, response.sessionData);
        setState((prev) => ({ ...prev, loading: false }));
        toast.success("Successfully joined the game session!");
        navigate(`/game/${sessionId}`);
        return { success: true, sessionId };
      } else {
        setState((prev) => ({ ...prev, loading: false }));
        return { success: false };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to join session";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    ...state,
    createGameSession,
    joinGameSession,
    clearError,
  };
};
