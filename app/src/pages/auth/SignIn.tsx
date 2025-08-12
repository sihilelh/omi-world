import { AuthHeader } from "../../components/molecules/AuthHeader";
import { SignInForm } from "../../components/organisms/SignInForm";
import { NavBar } from "../../components/molecules/NavBar";

export const SignInPage = () => {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 pt-24">
        <div className="w-full max-w-md">
          <div className="bg-neutral-800 rounded-lg shadow-xl p-8">
            <AuthHeader 
              title="Welcome back" 
              subtitle="Sign in to your account" 
            />
            <div className="mt-8">
              <SignInForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 