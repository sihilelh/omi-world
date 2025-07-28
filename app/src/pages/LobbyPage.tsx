import { NavBar } from "../components/molecules/NavBar";
import { CardTable } from "../components/molecules/CardTable";
import { LobbyContent } from "../components/molecules/LobbyContent";
import { createSession } from "../services/session.service";

export const LobbyPage = () => {
  const handleCreateGame = () => {
    createSession();
  };

  const handleJoinGame = () => {
    // TODO: Implement join game functionality
    console.log("Join game clicked");
  };

  return (
    <>
      <NavBar />
      <main className="h-[calc(100vh-5rem)] mt-20 relative flex items-center justify-center">
        <CardTable>
          <LobbyContent
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
          />
        </CardTable>
      </main>
    </>
  );
};
