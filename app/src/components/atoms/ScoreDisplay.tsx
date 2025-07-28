interface ScoreDisplayProps {
  redTeam?: number;
  blueTeam?: number;
}

export const ScoreDisplay = ({ redTeam = 0, blueTeam = 0 }: ScoreDisplayProps) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-neutral-800 rounded-full">
      <div className="bg-red-700 size-10 rounded-full flex items-center justify-center font-bold border-2 border-white">
        {redTeam}
      </div>
      <div className="bg-black size-10 rounded-full flex items-center justify-center font-bold border-2 border-white">
        {blueTeam}
      </div>
    </div>
  );
}; 