import { Button } from "../atoms/Button";

interface RoundSummaryProps {
  lastRoundTied: boolean;
  lastRoundWinner?: string;
  currentActiveSlot: number | null;
  mySlot: number;
  players: Array<{ userId: string; slot: number }>;
  onStartNextRound: () => void;
}

export const RoundSummary = ({
  lastRoundTied,
  lastRoundWinner,
  currentActiveSlot,
  mySlot,
  players,
  onStartNextRound,
}: RoundSummaryProps) => {
  const canStartNextRound = currentActiveSlot === mySlot;
  const activePlayer = players.find((player) => player.slot === currentActiveSlot);

  return (
    <div>
      <div className="text-center text-2xl font-bold mb-4">Round Summary</div>

      {lastRoundTied ? (
        <>
          <div className="text-center text-xl font-bold px-6 py-3 bg-gradient-to-r from-black to-red-900 rounded-full">
            The round was tied
          </div>
        </>
      ) : (
        <>
          <div className="text-center text-xl font-bold px-6 py-3 bg-black rounded-full">
            🎉 {lastRoundWinner} won the round
          </div>

          <div className="mt-4 text-xl text-center">
            points deducted from{" "}
            <span className="bg-red-500 px-2 rounded-full">
              {lastRoundWinner === "TEAM_RED" ? "team black" : "team red"}
            </span>
            .
          </div>
        </>
      )}

      {canStartNextRound ? (
        <div className="mt-4 text-center">
          <Button onClick={onStartNextRound}>Start Next Round</Button>
        </div>
      ) : (
        <div className="mt-4 text-center text-neutral-400">
          Wait till the next round starts by{" "}
          {activePlayer?.userId || "the other player"}.
        </div>
      )}
    </div>
  );
}; 