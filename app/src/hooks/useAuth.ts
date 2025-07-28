import { useEffect, useState } from "react";
import {
  type SignInInput,
  type SignUpInput,
  type ResetPasswordInput,
  type ConfirmResetPasswordInput,
  type AuthUser,
} from "aws-amplify/auth";
import { toast } from "sonner";
import {
  signInService,
  signUpService,
  signOutService,
  resetPasswordService,
  confirmResetPasswordService,
  getCurrentUserService,
} from "../services/auth.service";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check current user on mount
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const user = await getCurrentUserService();
      setState((prev) => ({ ...prev, user, loading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, user: null, loading: false }));
    }
  };

  const login = async (signInInput: SignInInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { isSignedIn, nextStep } = await signInService(signInInput);

      if (isSignedIn) {
        const user = await getCurrentUserService();
        setState((prev) => ({ ...prev, user, loading: false }));
        toast.success("Successfully signed in!");
        return { success: true, user };
      } else {
        setState((prev) => ({ ...prev, loading: false }));
        return { success: false, nextStep };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign in failed";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (signUpInput: SignUpInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { userId } = await signUpService(signUpInput);

      setState((prev) => ({ ...prev, loading: false }));
      toast.success(
        "Account created successfully! Please check your inbox and verify your email."
      );
      return { success: true, userId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign up failed";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await signOutService();
      setState((prev) => ({ ...prev, user: null, loading: false }));
      toast.success("Successfully signed out!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign out failed";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const resetPassword = async (resetPasswordInput: ResetPasswordInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { nextStep } = await resetPasswordService(resetPasswordInput);
      setState((prev) => ({ ...prev, loading: false }));
      toast.success("Password reset code sent to your email!");
      return { success: true, nextStep };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Password reset failed";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const confirmResetPassword = async (
    confirmResetPasswordInput: ConfirmResetPasswordInput
  ) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await confirmResetPasswordService(confirmResetPasswordInput);
      setState((prev) => ({ ...prev, loading: false }));
      toast.success("Password reset successfully!");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Password reset confirmation failed";
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    }
  };

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    confirmResetPassword,
    clearError,
  };
};
