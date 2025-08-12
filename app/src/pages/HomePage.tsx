import { NavBar } from "../components/molecules/NavBar";
import { Logo } from "../components/atoms/Logo";
import { Button } from "../components/atoms/Button";
import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-neutral-900 text-white pt-24">
        {/* Hero Section */}
        <section className="px-8 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Logo />
              <h1 className="text-6xl font-bold ml-4">
                Omi<span className="text-red-500">World</span>
              </h1>
            </div>
            <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the classic 4-player card game Omi in a modern, multiplayer online format. 
              Built with cutting-edge web technologies for seamless gameplay with friends.
            </p>
            <div className="flex items-center justify-center gap-6 mb-12">
              <Link to="/signup">
                <Button className="px-8 py-4 text-lg bg-red-600 hover:bg-red-700 transition-colors">
                  Get Started
                </Button>
              </Link>
              <Link to="/signin">
                <Button className="px-8 py-4 text-lg bg-neutral-700 hover:bg-neutral-600 transition-colors">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Summary Section */}
        <section className="px-8 py-16 bg-neutral-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6">About the Project</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Multiplayer Omi is a personal learning project by Sihilel H. Built from scratch to explore 
                real-time multiplayer technologies and cloud architecture.
              </p>
            </div>
            
            {/* Tech Highlights */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 bg-neutral-700 rounded-lg">
                <div className="text-4xl mb-4">🎮</div>
                <h3 className="text-xl font-bold mb-2">Real-time Gameplay</h3>
                <p className="text-gray-300">WebSocket-powered multiplayer with instant updates</p>
              </div>
              <div className="text-center p-6 bg-neutral-700 rounded-lg">
                <div className="text-4xl mb-4">☁️</div>
                <h3 className="text-xl font-bold mb-2">Cloud Native</h3>
                <p className="text-gray-300">Built on AWS with serverless architecture</p>
              </div>
              <div className="text-center p-6 bg-neutral-700 rounded-lg">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-xl font-bold mb-2">Secure</h3>
                <p className="text-gray-300">AWS Cognito authentication and secure APIs</p>
              </div>
            </div>

            {/* CTA to About Page */}
            <div className="text-center">
              <p className="text-lg text-gray-300 mb-6">
                Want to learn more about the technology behind OmiWorld?
              </p>
              <Link to="/about">
                <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors">
                  Read Full Story
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-8 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Play?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of players enjoying Omi online. Create a game session and invite your friends!
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/signup">
                <Button className="px-8 py-4 text-lg bg-red-600 hover:bg-red-700 transition-colors">
                  Create Account
                </Button>
              </Link>
              <Link to="/signin">
                <Button className="px-6 py-4 text-lg bg-neutral-700 hover:bg-neutral-600 transition-colors">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
