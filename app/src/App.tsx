import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { SignInPage } from "./pages/auth/SignIn";
import { SignUpPage } from "./pages/auth/SignUp";
import { ForgotPasswordPage } from "./pages/auth/ForgotPassword";
import { LobbyPage } from "./pages/LobbyPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GamePage } from "./pages/GamePage";
import { JoinPage } from "./pages/JoinPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/join/:sessionId" element={<JoinPage />} />
          <Route path="/game/:sessionId" element={<GamePage />} />
          <Route path="/" element={<Navigate to="/lobby" replace />} />
          <Route path="*" element={<Navigate to="/lobby" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
