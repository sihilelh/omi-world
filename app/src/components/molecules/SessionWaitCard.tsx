import { Copy } from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import { motion } from "motion/react";
import { Button } from "../atoms/Button";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";

export const SessionWaitCard = ({ startGame }: { startGame: () => void }) => {
  const { 
    sessionId,
    players,
    createdUser,
    status
  } = useSessionStore();
  const { user } = useAuth();
  const getTeamSlots = () => {
    const redPlayers =
      players.filter((p) => p.team === "TEAM_RED") || [];
    const blackPlayers =
      players.filter((p) => p.team === "TEAM_BLACK") || [];

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
  const totalPlayers = players.length || 0;
  const maxPlayers = 4;
  const playersNeeded = maxPlayers - totalPlayers;

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/join/${sessionId}`
    );
    toast.success("Invite link copied to clipboard");
  };

  const handleStartGame = () => {
    startGame();
  };

  return (
    <div className="flex flex-col items-center justify-center w-[80%] p-6">
      <motion.div
        className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-2xl shadow-xl"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-neutral-100 mb-2">
            Waiting for Players
          </h1>
          <p className="text-neutral-400">
            Session: {sessionId || "Loading..."}
          </p>
          <div className="mt-4">
            <Button className="w-full" onClick={handleCopyInviteLink}>
              <div className="flex items-center gap-2">
                <Copy size={12} /> <div>Copy Invite Link</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Player Count */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-100">
                {totalPlayers}/{maxPlayers}
              </div>
              <div className="text-sm text-neutral-400">Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-100">
                {playersNeeded}
              </div>
              <div className="text-sm text-neutral-400">Needed</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <motion.div
              className="bg-red-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(totalPlayers / maxPlayers) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Team Slots */}
        <div className="space-y-6">
          {/* RED Team */}
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              RED Team ({slots.red.occupied.length}/2)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((slotIndex) => {
                const player = slots.red.occupied[slotIndex];
                const isOccupied = !!player;

                return (
                  <motion.div
                    key={`red-${slotIndex}`}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isOccupied
                        ? "border-red-500 bg-red-500/20"
                        : "border-neutral-600 bg-neutral-800"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: slotIndex * 0.1 }}
                  >
                    {isOccupied ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-sm text-neutral-200 font-medium">
                          {player?.userId}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
                        <span className="text-sm text-neutral-400">
                          Waiting...
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* BLACK Team */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-400 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-neutral-500 rounded-full"></div>
              BLACK Team ({slots.black.occupied.length}/2)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((slotIndex) => {
                const player = slots.black.occupied[slotIndex];
                const isOccupied = !!player;

                return (
                  <motion.div
                    key={`black-${slotIndex}`}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isOccupied
                        ? "border-neutral-500 bg-neutral-500/20"
                        : "border-neutral-600 bg-neutral-800"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: slotIndex * 0.1 }}
                  >
                    {isOccupied ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
                        <span className="text-sm text-neutral-200 font-medium">
                          {player?.userId}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
                        <span className="text-sm text-neutral-400">
                          Waiting...
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Session Info */}
        {sessionId && (
          <div className="mt-6 p-4 bg-neutral-800/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-400">Created by:</span>
                <div className="text-neutral-200 font-medium">
                  {createdUser}
                </div>
              </div>
              <div>
                <span className="text-neutral-400">Status:</span>
                <div className="text-neutral-200 font-medium">
                  {status}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Animation */}
        {players.length !== 4 && (
          <div className="mt-6 text-center">
            <motion.div
              className="inline-flex items-center gap-2 text-neutral-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
              <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
              <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            </motion.div>
          </div>
        )}
        {players.length === 4 &&
          createdUser === user?.username && (
            <div className="mt-6 text-center">
              <Button className="w-full" onClick={handleStartGame}>
                Start Game
              </Button>
            </div>
          )}
        {players.length === 4 &&
          createdUser !== user?.username && (
            <div className="mt-6 text-center">
              Wait until the host starts the game
            </div>
          )}
      </motion.div>
    </div>
  );
};
