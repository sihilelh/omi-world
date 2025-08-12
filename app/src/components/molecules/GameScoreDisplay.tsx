import { ScoreDisplay } from "../atoms/ScoreDisplay";

interface GameScoreDisplayProps {
  redScore: number;
  blackScore: number;
  moveWins?: {
    TEAM_RED: number;
    TEAM_BLACK: number;
  };
}

export const GameScoreDisplay = ({ 
  redScore, 
  blackScore, 
  moveWins 
}: GameScoreDisplayProps) => {
  return (
    <div className="flex flex-col items-end">
      <div className="w-max">
        <ScoreDisplay redScore={redScore} blackScore={blackScore} />
      </div>
      {moveWins && moveWins.TEAM_RED >= 0 && moveWins.TEAM_BLACK >= 0 && (
        <div className="mt-4 flex flex-col items-end">
          <div className="text-lg font-bold">Move Wins</div>
          <div className="bg-neutral-200 rounded-full px-4 py-2 flex items-center gap-2 text-lg font-bold">
            <span className="text-red-500">{moveWins.TEAM_RED}</span>{" "}
            <span className="text-black">-</span>{" "}
            <span className="text-black">{moveWins.TEAM_BLACK}</span>
          </div>
        </div>
      )}
    </div>
  );
}; 