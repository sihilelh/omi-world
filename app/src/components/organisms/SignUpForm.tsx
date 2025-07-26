import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../atoms/Button";
import { AuthField } from "../molecules/AuthField";
import { useAuth } from "../../hooks/useAuth";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const SignUpForm = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await register({
        username: formData.username,
        password: formData.password,
        options: {
          userAttributes: {
            email: formData.email,
          },
        },
      });
      
      if (result.success) {
        navigate("/auth/signin");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AuthField
        label="Username"
        type="text"
        value={formData.username}
        onChange={handleChange("username")}
        error={errors.username}
        required
        autoComplete="username"
      />
      
      <AuthField
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange("email")}
        error={errors.email}
        required
        autoComplete="email"
      />
      
      <AuthField
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange("password")}
        error={errors.password}
        required
        autoComplete="new-password"
      />
      
      <AuthField
        label="Confirm Password"
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
        Create Account
      </Button>

      <div className="text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          to="/auth/signin"
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}; 