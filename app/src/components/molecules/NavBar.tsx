import { Link } from "react-router-dom";
import { Logo } from "../atoms/Logo";
import { ScoreDisplay } from "../atoms/ScoreDisplay";

interface NavBarProps {
  gameMode?: boolean;
  redTeam?: number;
  blueTeam?: number;
}

export const NavBar = ({ gameMode, redTeam, blueTeam }: NavBarProps) => {
  return (
    <div className="fixed z-50 top-0 left-0 w-full h-20 bg-neutral-900 items-center flex px-8 justify-between">
      <div className="flex items-center w-full">
        <Logo />
        <div className="text-white text-2xl font-bold ml-4">OmiWorld</div>
      </div>
      {gameMode ? (
        <ScoreDisplay redScore={redTeam || 0} blackScore={blueTeam || 0} />
      ) : (
        <div>
          <Link to="/">About</Link>
        </div>
      )}
    </div>
  );
};
