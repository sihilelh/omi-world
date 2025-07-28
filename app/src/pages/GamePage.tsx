import { useParams } from "react-router-dom";
export const GamePage = () => {
  const { sessionId } = useParams();

  return (
    <div>
      <h1>Game Page: {sessionId}</h1>
    </div>
  );
};
