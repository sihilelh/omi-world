import { Logo } from "../atoms/Logo";
import { Button } from "../atoms/Button";

interface LobbyContentProps {
  onCreateGame: () => void;
  onJoinGame: () => void;
}

export const LobbyContent = ({ onCreateGame, onJoinGame }: LobbyContentProps) => {
  return (
    <div className="text-center w-[90%]">
      <div className="flex items-center justify-center mb-4">
        <Logo />
      </div>
      <div className="font-bold text-2xl mb-4">
        Welcome to <span className="text-red-500">Omi</span>World
      </div>
      <div>Please create a session or join an existing one.</div>
      <div className="flex items-center justify-center mt-4 gap-2">
        <Button variant="primary" onClick={onCreateGame}>
          Create A Game
        </Button>
        <Button variant="secondary" onClick={onJoinGame}>
          Join A Game
        </Button>
      </div>
    </div>
  );
}; 