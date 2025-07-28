import { type ReactNode } from "react";

interface AuthHeaderProps {
  title: string;
  subtitle?: ReactNode;
}

export const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && (
        <p className="text-neutral-400 text-sm">{subtitle}</p>
      )}
    </div>
  );
}; 