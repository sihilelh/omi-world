import { AuthHeader } from "../../components/molecules/AuthHeader";
import { ForgotPasswordForm } from "../../components/organisms/ForgotPasswordForm";
import { NavBar } from "../../components/molecules/NavBar";

export const ForgotPasswordPage = () => {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 pt-24">
        <div className="w-full max-w-md">
          <div className="bg-neutral-800 rounded-lg shadow-xl p-8">
            <AuthHeader 
              title="Reset password" 
              subtitle="Enter your email to receive a reset code" 
            />
            <div className="mt-8">
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 