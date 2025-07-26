import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "../atoms/Input";
import { Label } from "../atoms/Label";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, error, required = false, id, ...props }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
        <Input
          ref={ref}
          id={fieldId}
          error={error}
          {...props}
        />
      </div>
    );
  }
);

AuthField.displayName = "AuthField"; 