interface ScoreDisplayProps {
  redScore: number;
  blackScore: number;
  className?: string;
}

export const ScoreDisplay = ({ redScore, blackScore, className = "" }: ScoreDisplayProps) => {
  return (
    <div className={`bg-neutral-800 p-2 flex gap-2 rounded-full ${className}`}>
      <div className="w-8 h-8 bg-red-600 border-2 border-white rounded-full flex items-center justify-center font-bold">
        {redScore}
      </div>
      <div className="w-8 h-8 bg-black border-2 border-white rounded-full flex items-center justify-center font-bold">
        {blackScore}
      </div>
    </div>
  );
}; 