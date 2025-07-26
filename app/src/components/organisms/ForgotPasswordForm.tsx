import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../atoms/Button";
import { AuthField } from "../molecules/AuthField";
import { useAuth } from "../../hooks/useAuth";

interface FormData {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  code?: string;
  newPassword?: string;
  confirmPassword?: string;
}

type Step = "email" | "reset";

export const ForgotPasswordForm = () => {
  const { resetPassword, confirmResetPassword, loading } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validatePassword = (password: string): string | undefined => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one digit";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validateEmailStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Reset code is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) newErrors.newPassword = passwordError;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmailStep()) return;

    try {
      const result = await resetPassword({
        username: formData.email,
      });
      
      if (result.success) {
        setStep("reset");
      }
    } catch (error) {
      // Error is handled by useAuth hook
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateResetStep()) return;

    try {
      const result = await confirmResetPassword({
        username: formData.email,
        confirmationCode: formData.code,
        newPassword: formData.newPassword,
      });
      
      if (result.success) {
        // Redirect to sign in page
        window.location.href = "/signin";
      }
    } catch (error) {
      // Error is handled by useAuth hook
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (step === "email") {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-6">
        <AuthField
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          error={errors.email}
          required
          autoComplete="email"
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          Send Reset Code
        </Button>

        <div className="text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link
            to="/signin"
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleResetSubmit} className="space-y-6">
      <AuthField
        label="Reset Code"
        type="text"
        value={formData.code}
        onChange={handleChange("code")}
        error={errors.code}
        required
        placeholder="Enter the code sent to your email"
      />
      
      <AuthField
        label="New Password"
        type="password"
        value={formData.newPassword}
        onChange={handleChange("newPassword")}
        error={errors.newPassword}
        required
        autoComplete="new-password"
      />
      
      <AuthField
        label="Confirm New Password"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange("confirmPassword")}
        error={errors.confirmPassword}
        required
        autoComplete="new-password"
      />

      <div className="text-xs text-gray-400 space-y-1">
        <p>Password requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>At least 8 characters long</li>
          <li>Contains at least one digit</li>
          <li>Contains at least one lowercase letter</li>
          <li>Contains at least one uppercase letter</li>
        </ul>
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={loading}
      >
        Reset Password
      </Button>

      <div className="text-center text-sm text-gray-400">
        <button
          type="button"
          onClick={() => setStep("email")}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          Back to email step
        </button>
      </div>
    </form>
  );
}; 