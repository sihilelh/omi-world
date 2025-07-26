import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../atoms/Button";
import { AuthField } from "../molecules/AuthField";
import { useAuth } from "../../hooks/useAuth";

interface FormData {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
}

export const SignInForm = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username or email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
      });
      
      if (result.success) {
        navigate("/lobby");
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
        label="Username or Email"
        type="text"
        value={formData.username}
        onChange={handleChange("username")}
        error={errors.username}
        required
        autoComplete="username"
      />
      
      <AuthField
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange("password")}
        error={errors.password}
        required
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <Link
          to="/auth/forgot-password"
          className="text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={loading}
        disabled={loading}
      >
        Sign In
      </Button>

      <div className="text-center text-sm text-gray-400">
        Don't have an account?{" "}
        <Link
          to="/auth/signup"
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
}; 