import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavBar } from "../components/molecules/NavBar";
import { JoinSessionDialog } from "../components/molecules/SessionIdDialog";
import { useGameSession } from "../hooks/useGameSession";
import { getSession } from "../services/session.service";
import { toast } from "sonner";

export const JoinPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const { joinGameSession, loading } = useGameSession();

  useEffect(() => {
    const validateSession = async () => {
      if (!sessionId) {
        toast.error("Invalid session ID");
        navigate("/lobby");
        return;
      }

      try {
        const response = await getSession(sessionId);
        if (response) {
          // Session exists, open dialog
          setIsDialogOpen(true);
        } else {
          toast.error("Session not found");
          navigate("/lobby");
        }
      } catch (error) {
        toast.error("Failed to validate session");
        navigate("/lobby");
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [sessionId, navigate]);

  const handleJoinSession = async (sessionId: string, selectedTeam: string) => {
    await joinGameSession(sessionId, selectedTeam);
    setIsDialogOpen(false);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Redirect back to lobby when dialog is closed
    navigate("/lobby");
  };

  // Show loading state while validating
  if (isValidating) {
    return (
      <>
        <NavBar />
        <main className="h-[calc(100vh-5rem)] mt-20 relative flex items-center justify-center">
          <div className="text-neutral-400">Validating session...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="h-[calc(100vh-5rem)] mt-20 relative flex items-center justify-center">
        <JoinSessionDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleJoinSession}
          preFilledSessionId={sessionId}
          skipToTeamSelection={true}
          loading={loading}
        />
      </main>
    </>
  );
};
