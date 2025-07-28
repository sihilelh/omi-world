import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required = false, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium text-neutral-200",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label"; 