import { create } from "zustand";
import type { SessionData } from "../services/session.service";

interface SessionState {
  sessionId: string | null;
  sessionData: SessionData | null;
  setSession: (sessionId: string, sessionData: SessionData) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  sessionData: null,
  setSession: (sessionId, sessionData) => set({ sessionId, sessionData }),
  clearSession: () => set({ sessionId: null, sessionData: null }),
}));
