import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { SignInPage } from "./pages/auth/SignIn";
import { SignUpPage } from "./pages/auth/SignUp";
import { ForgotPasswordPage } from "./pages/auth/ForgotPassword";
import { LobbyPage } from "./pages/LobbyPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/lobby" 
          element={
            <ProtectedRoute>
              <LobbyPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Redirects */}
        <Route path="/" element={<Navigate to="/auth/signin" replace />} />
        <Route path="/sign-in" element={<Navigate to="/auth/signin" replace />} />
        <Route path="*" element={<Navigate to="/auth/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
