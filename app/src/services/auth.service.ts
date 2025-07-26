import { 
  signIn, 
  signUp, 
  signOut, 
  resetPassword, 
  confirmResetPassword,
  getCurrentUser,
  type SignInInput,
  type SignUpInput,
  type ResetPasswordInput,
  type ConfirmResetPasswordInput,
  type AuthUser
} from "aws-amplify/auth";

export const signInService = async (signInInput: SignInInput) => {
  try {
    const user = await signIn(signInInput);
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const signUpService = async (signUpInput: SignUpInput) => {
  try {
    const result = await signUp(signUpInput);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const signOutService = async () => {
  try {
    await signOut();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const resetPasswordService = async (resetPasswordInput: ResetPasswordInput) => {
  try {
    const result = await resetPassword(resetPasswordInput);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const confirmResetPasswordService = async (confirmResetPasswordInput: ConfirmResetPasswordInput) => {
  try {
    await confirmResetPassword(confirmResetPasswordInput);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCurrentUserService = async (): Promise<AuthUser> => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
