import { create } from "zustand";
import type { CreateSessionResponse } from "../services/session.service";

interface SessionState {
  sessionId: string | null;
  sessionData: CreateSessionResponse["sessionData"] | null;
  setSession: (
    sessionId: string,
    sessionData: CreateSessionResponse["sessionData"]
  ) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  sessionData: null,
  setSession: (sessionId, sessionData) => set({ sessionId, sessionData }),
  clearSession: () => set({ sessionId: null, sessionData: null }),
}));
