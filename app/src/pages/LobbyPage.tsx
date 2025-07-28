import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/atoms/Button";

export const LobbyPage = () => {
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Error is handled by useAuth hook
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-neutral-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to the Lobby</h1>
            <p className="text-neutral-400">You're successfully signed in!</p>
          </div>

          {user && (
            <div className="bg-neutral-700 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">User Details</h2>
              <div className="space-y-3 text-neutral-300">
                <div className="flex justify-between">
                  <span className="font-medium">User ID:</span>
                  <span className="font-mono text-sm">{user.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Username:</span>
                  <span>{user.username}</span>
                </div>
                {user.signInDetails && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Login ID:</span>
                      <span>{user.signInDetails.loginId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Auth Flow:</span>
                      <span>{user.signInDetails.authFlowType}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleLogout}
              loading={loading}
              disabled={loading}
              variant="outline"
              size="lg"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 