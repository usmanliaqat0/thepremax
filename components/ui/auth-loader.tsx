"use client";

import { RefreshLoader } from "./loader";

interface AuthLoaderProps {
  message?: string;
  showMessage?: boolean;
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "default" | "light" | "dark" | "muted";
  className?: string;
}

export const AuthLoader = ({
  message = "Loading",
  showMessage = false,
  size = "lg",
  variant = "default",
  className = "",
}: AuthLoaderProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <RefreshLoader size={size} variant={variant} />
      {showMessage && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export const AuthPageLoader = ({
  message = "Loading",
  showMessage = false,
  size = "lg",
  variant = "default",
}: Omit<AuthLoaderProps, "className">) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthLoader
        message={message}
        showMessage={showMessage}
        size={size}
        variant={variant}
      />
    </div>
  );
};
