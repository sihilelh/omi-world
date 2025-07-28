import { useParams } from "react-router-dom";
import { NavBar } from "../components/molecules/NavBar";
import { useEffect } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { getSession } from "../services/session.service";
import { PlayCard } from "../components/atoms/PlayCard";

export const GamePage = () => {
  const { sessionId } = useParams();
  const { setSession, sessionData } = useSessionStore();

  useEffect(() => {
    // If sessionId is present in the URL, fetch and store session data
    if (sessionId) {
      getSession(sessionId).then((data) => {
        if (data && data.sessionData) {
          setSession(sessionId, data.sessionData);
        }
      });
    }
  }, [sessionId, setSession]);

  return (
    <>
      <NavBar />
      <main className="h-[calc(100vh-5rem)] mt-20 relative flex items-center justify-center">
      
      </main>
    </>
  );
};
