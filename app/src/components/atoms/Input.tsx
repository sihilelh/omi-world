import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-200 mb-2">
            {label}
          </label>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-lg border bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-400",
            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-red-500" : "border-neutral-600",
            className
          )}
          ref={ref}
          id={inputId}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input"; 