import { Button } from "../atoms/Button";
import { useNavigate } from "react-router-dom";

interface GameEndedCardProps {
  winnerTeam: "TEAM_RED" | "TEAM_BLACK" | null;
  allRoundsWins: {
    moveWins: { TEAM_RED: number; TEAM_BLACK: number };
    isRoundTied: boolean;
    roundWonTeam: "TEAM_RED" | "TEAM_BLACK";
    roundLostTeam: "TEAM_RED" | "TEAM_BLACK";
  }[];
}

export const GameEndedCard = ({
  winnerTeam,
  allRoundsWins,
}: GameEndedCardProps) => {
  const navigate = useNavigate();

  const getTeamDisplayName = (team: "TEAM_RED" | "TEAM_BLACK") => {
    return team === "TEAM_RED" ? "Team Red" : "Team Black";
  };

  const getTeamColor = (team: "TEAM_RED" | "TEAM_BLACK") => {
    return team === "TEAM_RED" ? "bg-red-500" : "bg-black";
  };

  const handleReturnToLobby = () => {
    navigate("/lobby");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
      {/* Winner Announcement */}
      <div className="text-center text-3xl font-bold mb-6">
        🎉 {winnerTeam && getTeamDisplayName(winnerTeam)} won the game! 🎉
      </div>

      {/* Game Summary */}
      <div className="text-center text-xl font-bold mb-6 px-6 py-3 bg-gradient-to-r from-red-500 to-black rounded-full text-white">
        Game Summary
      </div>

      {/* Round Details */}
      <div className="space-y-3 mb-8">
        {allRoundsWins.map((round, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
          >
            <span className="font-semibold">Round {index + 1}</span>
            <div className="flex items-center gap-2">
              {round.isRoundTied ? (
                <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-medium">
                  Tied
                </span>
              ) : (
                <span
                  className={`px-3 py-1 ${getTeamColor(
                    round.roundWonTeam
                  )} text-white rounded-full text-sm font-medium`}
                >
                  {getTeamDisplayName(round.roundWonTeam)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Return to Lobby Button */}
      <div className="text-center">
        <Button onClick={handleReturnToLobby}>
          Return to Lobby
        </Button>
      </div>
    </div>
  );
};
