import { Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import TableImg from "../assets/other/table.svg";
import { Button } from "../components";
import { createSession } from "../services/session.service";

export const LobbyPage = () => {
  return (
    <>
      <NavBar />
      <main className="h-[calc(100vh-5rem)] mt-20 relative flex items-center justify-center">
        {/* Card Table  */}
        <CardTable>
          <div className="text-center w-[90%]">
            <div className="flex items-center justify-center mb-4">
              <img src={Logo} alt="Logo" className="w-10 h-10" />
            </div>
            <div className="font-bold text-2xl mb-4">
              Welcome to <span className="text-red-500">Omi</span>World
            </div>
            <div>Please create a session or join an existing one.</div>
            <div className="flex items-center justify-center mt-4 gap-2">
              <Button variant="primary" onClick={createSession}>
                Create A Game
              </Button>
              <Button variant="secondary">Join A Game</Button>
            </div>
          </div>
        </CardTable>
      </main>
    </>
  );
};

export const NavBar = (props?: {
  gameMode?: boolean;
  redTeam?: number;
  blueTeam?: number;
}) => {
  return (
    <div className="fixed z-50 top-0 left-0 w-full h-20 bg-neutral-900 items-center flex px-8 justify-between">
      <div className="flex items-center w-full">
        <img src={Logo} alt="Logo" className="w-10 h-10" />
        <div className="text-white text-2xl font-bold ml-4">OmiWorld</div>
      </div>
      {props?.gameMode ? (
        <div>
          <div className="flex items-center gap-2 p-2 bg-neutral-800 rounded-full">
            <div className="bg-red-700 size-10 rounded-full flex items-center justify-center font-bold border-2 border-white">
              {props?.redTeam || 0}
            </div>
            <div className="bg-black size-10 rounded-full flex items-center justify-center font-bold border-2 border-white">
              {props?.blueTeam || 0}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Link to="/">About</Link>
        </div>
      )}
    </div>
  );
};

export const CardTable = (props: { children?: React.ReactNode }) => {
  return (
    <div className="relative h-[50vh] w-auto">
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        {props.children}
      </div>
      <img src={TableImg} className="h-full w-auto" alt="Card Table" />
    </div>
  );
};
