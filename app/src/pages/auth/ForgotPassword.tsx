import { AuthHeader } from "../../components/molecules/AuthHeader";
import { ForgotPasswordForm } from "../../components/organisms/ForgotPasswordForm";

export const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
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
  );
}; 