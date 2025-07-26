import { signIn, type SignInInput } from "aws-amplify/auth";

export const signInService = async (signInInput: SignInInput) => {
  try {
    const user = await signIn(signInInput);
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
