import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { getSession } from "../../services/session.service";
import { toast } from "sonner";

interface Player {
  userId: string;
  team: string;
}

interface SessionData {
  pk: string;
  createdAt: string;
  status: string;
  createdUser: string;
  currentActiveUser: string;
  currentRound: number;
  teams: Array<{ teamId: string; score: number }>;
  players: Array<Player>;
}

interface JoinSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionId: string, selectedTeam: string) => void;
  loading?: boolean;
}

export const JoinSessionDialog = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: JoinSessionDialogProps) => {
  const [step, setStep] = useState(1);
  const [sessionId, setSessionId] = useState("");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [fetchingSession, setFetchingSession] = useState(false);

  const handleSessionIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim()) return;

    setFetchingSession(true);
    try {
      const response = await getSession(sessionId.trim());
      if (response) {
        setSessionData(response.sessionData);
        setStep(2);
      } else {
        toast.error("Session not found");
      }
    } catch (error) {
      toast.error("Failed to fetch session details");
    } finally {
      setFetchingSession(false);
    }
  };

  const handleJoinSession = () => {
    if (selectedTeam && sessionId.trim()) {
      onSubmit(sessionId.trim(), selectedTeam);
    }
  };

  const handleClose = () => {
    setSessionId("");
    setSessionData(null);
    setSelectedTeam("");
    setStep(1);
    onClose();
  };

  const getTeamSlots = () => {
    const redPlayers =
      sessionData?.players.filter((p) => p.team === "TEAM_1") || [];
    const blackPlayers =
      sessionData?.players.filter((p) => p.team === "TEAM_2") || [];

    return {
      red: {
        occupied: redPlayers.slice(0, 2),
        available: Math.max(0, 2 - redPlayers.length),
      },
      black: {
        occupied: blackPlayers.slice(0, 2),
        available: Math.max(0, 2 - blackPlayers.length),
      },
    };
  };

  const slots = getTeamSlots();
  const totalAvailable = slots.red.available + slots.black.available;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild>
                <motion.div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                  <motion.div
                    className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-md shadow-xl"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Dialog.Title className="text-xl font-bold text-neutral-100">
                        {step === 1 ? "Join Game Session" : "Select Your Team"}
                      </Dialog.Title>
                      <Dialog.Close asChild>
                        <button className="text-neutral-400 hover:text-neutral-300 transition-colors">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </Dialog.Close>
                    </div>

                    {step === 1 ? (
                      <form onSubmit={handleSessionIdSubmit}>
                        <div className="mb-4">
                          <label
                            htmlFor="sessionId"
                            className="block text-sm font-medium text-neutral-200 mb-2"
                          >
                            Session ID
                          </label>
                          <Input
                            id="sessionId"
                            type="text"
                            value={sessionId}
                            onChange={(e) => setSessionId(e.target.value)}
                            placeholder="Enter session ID (e.g., mdltirqs)"
                            disabled={loading || fetchingSession}
                            required
                          />
                        </div>

                        <div className="flex gap-3 justify-end">
                          <Dialog.Close asChild>
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={loading || fetchingSession}
                            >
                              Cancel
                            </Button>
                          </Dialog.Close>
                          <Button
                            type="submit"
                            variant="primary"
                            loading={fetchingSession}
                            disabled={!sessionId.trim() || loading}
                          >
                            Next
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-neutral-100 mb-2">
                            Session: {sessionId}
                          </h3>
                          <p className="text-sm text-neutral-400 mb-4">
                            Select an available slot to join the game
                          </p>
                        </div>

                        <div className="space-y-4 mb-6">
                          {/* RED Team */}
                          <div>
                            <h4 className="text-sm font-medium text-red-400 mb-2">
                              RED Team
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {[0, 1].map((slotIndex) => {
                                const player = slots.red.occupied[slotIndex];
                                const isOccupied = !!player;
                                const isSelected = selectedTeam === "TEAM_1";

                                return (
                                  <button
                                    key={`red-${slotIndex}`}
                                    onClick={() =>
                                      !isOccupied && setSelectedTeam("TEAM_1")
                                    }
                                    disabled={isOccupied}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                      isOccupied
                                        ? "border-neutral-600 bg-neutral-800 cursor-not-allowed"
                                        : isSelected
                                        ? "border-red-500 bg-red-500/20"
                                        : "border-neutral-600 hover:border-red-500 hover:bg-red-500/10"
                                    }`}
                                  >
                                    {isOccupied ? (
                                      <span className="text-sm text-neutral-300">
                                        {player?.userId}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-neutral-400">
                                        Available
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* BLACK Team */}
                          <div>
                            <h4 className="text-sm font-medium text-neutral-400 mb-2">
                              BLACK Team
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {[0, 1].map((slotIndex) => {
                                const player = slots.black.occupied[slotIndex];
                                const isOccupied = !!player;
                                const isSelected = selectedTeam === "TEAM_2";

                                return (
                                  <button
                                    key={`black-${slotIndex}`}
                                    onClick={() =>
                                      !isOccupied && setSelectedTeam("TEAM_2")
                                    }
                                    disabled={isOccupied}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                      isOccupied
                                        ? "border-neutral-600 bg-neutral-800 cursor-not-allowed"
                                        : isSelected
                                        ? "border-neutral-500 bg-neutral-500/20"
                                        : "border-neutral-600 hover:border-neutral-500 hover:bg-neutral-500/10"
                                    }`}
                                  >
                                    {isOccupied ? (
                                      <span className="text-sm text-neutral-300">
                                        {player?.userId}
                                      </span>
                                    ) : (
                                      <span className="text-sm text-neutral-400">
                                        Available
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {totalAvailable === 0 && (
                          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                            <p className="text-sm text-red-400">
                              This session is full
                            </p>
                          </div>
                        )}

                        <div className="flex gap-3 justify-end">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setStep(1)}
                            disabled={loading}
                          >
                            Back
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={handleJoinSession}
                            loading={loading}
                            disabled={!selectedTeam || totalAvailable === 0}
                          >
                            Join Session
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
