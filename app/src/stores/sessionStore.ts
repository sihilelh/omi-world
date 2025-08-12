import { create } from "zustand";
import type { SessionData, Player, Team } from "../services/session.service";

interface SessionState {
  // Individual session properties
  sessionId: string | null;
  status: string | null;
  createdAt: string | null;
  createdUser: string | null;
  currentActiveSlot: number | null;
  currentRound: number | null;
  players: Player[];
  teams: Team[];
  lastRoundTied: boolean | null;
  lastRoundWinner: "TEAM_RED" | "TEAM_BLACK" | null;

  // Game ended properties
  winnerTeam: "TEAM_RED" | "TEAM_BLACK" | null;
  allRoundsWins: {
    moveWins: { TEAM_RED: number; TEAM_BLACK: number };
    isRoundTied: boolean;
    roundWonTeam: "TEAM_RED" | "TEAM_BLACK";
    roundLostTeam: "TEAM_RED" | "TEAM_BLACK";
  }[];

  // Individual setter methods
  setSessionId: (sessionId: string) => void;
  setStatus: (status: string) => void;
  setCreatedAt: (createdAt: string) => void;
  setCreatedUser: (createdUser: string) => void;
  setCurrentActiveSlot: (currentActiveSlot: number) => void;
  setCurrentRound: (currentRound: number) => void;
  setPlayers: (players: Player[]) => void;
  setTeams: (teams: Team[]) => void;
  setLastRoundTied: (lastRoundTied: boolean) => void;
  setLastRoundWinner: (
    lastRoundWinner: "TEAM_RED" | "TEAM_BLACK" | null
  ) => void;

  // Game ended setters
  setWinnerTeam: (winnerTeam: "TEAM_RED" | "TEAM_BLACK" | null) => void;
  setAllRoundsWins: (
    allRoundsWins: {
      moveWins: { TEAM_RED: number; TEAM_BLACK: number };
      isRoundTied: boolean;
      roundWonTeam: "TEAM_RED" | "TEAM_BLACK";
      roundLostTeam: "TEAM_RED" | "TEAM_BLACK";
    }[]
  ) => void;

  // Bulk update methods
  setSession: (sessionId: string, sessionData: SessionData) => void;
  updateSessionData: (sessionData: Partial<SessionData>) => void;
  clearSession: () => void;

  // Computed getters (for backward compatibility)
  get sessionData(): SessionData | null;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  sessionId: null,
  status: null,
  createdAt: null,
  createdUser: null,
  currentActiveSlot: null,
  currentRound: null,
  players: [],
  teams: [],
  lastRoundTied: null,
  lastRoundWinner: null,

  // Game ended state
  winnerTeam: null,
  allRoundsWins: [],

  // Individual setters
  setSessionId: (sessionId) => set({ sessionId }),
  setStatus: (status) => set({ status }),
  setCreatedAt: (createdAt) => set({ createdAt }),
  setCreatedUser: (createdUser) => set({ createdUser }),
  setCurrentActiveSlot: (currentActiveSlot) => set({ currentActiveSlot }),
  setCurrentRound: (currentRound) => set({ currentRound }),
  setPlayers: (players) => set({ players }),
  setTeams: (teams) => set({ teams }),
  setLastRoundTied: (lastRoundTied) => set({ lastRoundTied }),
  setLastRoundWinner: (lastRoundWinner) => set({ lastRoundWinner }),

  // Game ended setters
  setWinnerTeam: (winnerTeam) => set({ winnerTeam }),
  setAllRoundsWins: (allRoundsWins) => set({ allRoundsWins }),

  // Bulk update methods
  setSession: (sessionId, sessionData) => {
    set({
      sessionId,
      status: sessionData.status,
      createdAt: sessionData.createdAt,
      createdUser: sessionData.createdUser,
      currentActiveSlot: sessionData.currentActiveSlot,
      currentRound: sessionData.currentRound,
      players: sessionData.players,
      teams: sessionData.teams,
      lastRoundTied: sessionData.lastRoundTied || null,
      lastRoundWinner: sessionData.lastRoundWinner || null,
    });
  },

  updateSessionData: (sessionData) => {
    set((state) => ({
      ...state,
      ...(sessionData.status !== undefined && { status: sessionData.status }),
      ...(sessionData.createdAt !== undefined && {
        createdAt: sessionData.createdAt,
      }),
      ...(sessionData.createdUser !== undefined && {
        createdUser: sessionData.createdUser,
      }),
      ...(sessionData.currentActiveSlot !== undefined && {
        currentActiveSlot: sessionData.currentActiveSlot,
      }),
      ...(sessionData.currentRound !== undefined && {
        currentRound: sessionData.currentRound,
      }),
      ...(sessionData.players !== undefined && {
        players: sessionData.players,
      }),
      ...(sessionData.teams !== undefined && { teams: sessionData.teams }),
      ...(sessionData.lastRoundTied !== undefined && {
        lastRoundTied: sessionData.lastRoundTied,
      }),
      ...(sessionData.lastRoundWinner !== undefined && {
        lastRoundWinner: sessionData.lastRoundWinner,
      }),
    }));
  },

  clearSession: () =>
    set({
      sessionId: null,
      status: null,
      createdAt: null,
      createdUser: null,
      currentActiveSlot: null,
      currentRound: null,
      players: [],
      teams: [],
      lastRoundTied: null,
      lastRoundWinner: null,
      winnerTeam: null,
      allRoundsWins: [],
    }),

  // Computed getter for backward compatibility
  get sessionData() {
    const state = get();
    if (!state.sessionId) return null;

    return {
      pk: state.sessionId,
      createdAt: state.createdAt!,
      status: state.status!,
      createdUser: state.createdUser!,
      currentActiveSlot: state.currentActiveSlot!,
      currentRound: state.currentRound!,
      teams: state.teams,
      players: state.players,
      lastRoundTied: state.lastRoundTied || undefined,
      lastRoundWinner: state.lastRoundWinner || undefined,
    };
  },
}));
