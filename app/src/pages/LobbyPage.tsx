import { useState } from "react";
import { NavBar } from "../components/molecules/NavBar";
import { CardTable } from "../components/molecules/CardTable";
import { LobbyContent } from "../components/molecules/LobbyContent";
import { JoinSessionDialog } from "../components/molecules/SessionIdDialog";
import { useGameSession } from "../hooks/useGameSession";

export const LobbyPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createGameSession, joinGameSession, loading } = useGameSession();

  const handleCreateGame = async () => {
    await createGameSession();
  };

  const handleJoinGame = () => {
    setIsDialogOpen(true);
  };

  const handleJoinSession = async (sessionId: string, team: string) => {
    await joinGameSession(sessionId, team);
    setIsDialogOpen(false);
  };

  return (
    <>
      <NavBar />
      <main className="h-[calc(100vh-5rem)] mt-20 relative flex items-center justify-center">
        <CardTable>
          <LobbyContent
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
            loading={loading}
          />
        </CardTable>
      </main>
      <JoinSessionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleJoinSession}
        loading={loading}
      />
    </>
  );
};
