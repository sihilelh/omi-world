import { AuthHeader } from "../../components/molecules/AuthHeader";
import { SignInForm } from "../../components/organisms/SignInForm";

export const SignInPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
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
  );
}; 