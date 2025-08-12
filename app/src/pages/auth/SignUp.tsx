import { AuthHeader } from "../../components/molecules/AuthHeader";
import { SignUpForm } from "../../components/organisms/SignUpForm";
import { NavBar } from "../../components/molecules/NavBar";

export const SignUpPage = () => {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 pt-24">
        <div className="w-full max-w-md">
          <div className="bg-neutral-800 rounded-lg shadow-xl p-8">
            <AuthHeader 
              title="Create account" 
              subtitle="Join us today" 
            />
            <div className="mt-8">
              <SignUpForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 