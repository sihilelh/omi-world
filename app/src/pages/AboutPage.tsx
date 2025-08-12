import { NavBar } from "../components/molecules/NavBar";
import { Logo } from "../components/atoms/Logo";

export const AboutPage = () => {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-neutral-900 text-white pt-24 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Logo />
              <h1 className="text-4xl font-bold ml-4">About OmiWorld</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Multiplayer Omi is a simple online version of the classic 4-player
              card game Omi — built as a personal learning project by Sihilel H.
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            <div className="bg-neutral-800 rounded-lg p-6">
              <p className="text-lg leading-relaxed">
                The idea behind this project was to combine two things I enjoy:
                playing Omi and exploring new technology. Rather than just
                watching tutorials, I wanted to build something real from
                scratch — something that would help me learn by doing (and
                sometimes failing). This project became a way to get hands-on
                experience with modern web technologies and cloud architecture.
              </p>
            </div>

            {/* Tech Stack */}
            <div className="bg-neutral-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">🔧</span>
                What's Under the Hood
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>
                      <strong>Frontend:</strong> Built with React and deployed
                      on Firebase
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>
                      <strong>Authentication:</strong> Handled via AWS Cognito
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>
                      <strong>Game Data:</strong> Stored in DynamoDB
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>
                      <strong>APIs & Logic:</strong> AWS Lambda and API Gateway
                      power both REST and WebSocket APIs
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>
                      <strong>Infrastructure:</strong> Managed using AWS CDK
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-300">
                All game logic — card shuffling, turn management, and win
                detection — is processed on the server to ensure fairness and
                consistency.
              </p>
            </div>

            {/* How to Play */}
            <div className="bg-neutral-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="text-2xl mr-2">🎮</span>
                How to Play
              </h2>
              <ul className="space-y-2 text-lg">
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>You'll need 4 players to start a game</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    Works best on desktop (mobile support is still in progress)
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>
                    You'll need to sign in to create or join a game session
                  </span>
                </li>
              </ul>
            </div>

            {/* Closing */}
            <div className="bg-neutral-800 rounded-lg p-6">
              <p className="text-lg leading-relaxed mb-4">
                Whether you're here to try out a new way to play Omi with
                friends, or just curious about how real-time multiplayer apps
                can be built using AWS — hope you enjoy it!
              </p>
              <p className="text-lg">
                If you have feedback or find bugs, feel free to reach out on our{" "}
                <a
                  href="https://github.com/sihilelh/omi-world"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  GitHub repository
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
