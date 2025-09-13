"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const loaderVariants = cva(
  "animate-spin rounded-full border-solid border-t-transparent",
  {
    variants: {
      variant: {
        default: "border-primary",
        light: "border-white border-t-transparent",
        dark: "border-gray-800 border-t-transparent",
        muted: "border-gray-400 border-t-transparent",
      },
      size: {
        xs: "w-3 h-3 border-2",
        sm: "w-4 h-4 border-2",
        default: "w-6 h-6 border-2",
        lg: "w-8 h-8 border-3",
        xl: "w-12 h-12 border-4",
        "2xl": "w-16 h-16 border-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const spinnerVariants = cva("inline-block animate-spin", {
  variants: {
    size: {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      default: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12",
      "2xl": "w-16 h-16",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface LoaderProps extends VariantProps<typeof loaderVariants> {
  className?: string;
}

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  variant?: "default" | "light" | "dark" | "muted";
}

// Simple circular loader
export const Loader = ({ variant, size, className, ...props }: LoaderProps) => {
  return (
    <div
      className={cn(loaderVariants({ variant, size, className }))}
      {...props}
    />
  );
};

// SVG-based spinner with better animation
export const Spinner = ({
  size,
  variant = "default",
  className,
  ...props
}: SpinnerProps) => {
  const colorClasses = {
    default: "text-primary",
    light: "text-white",
    dark: "text-gray-800",
    muted: "text-gray-400",
  };

  return (
    <svg
      className={cn(
        spinnerVariants({ size }),
        colorClasses[variant],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Dots loader animation
export const DotsLoader = ({
  size = "default",
  variant = "default",
  className,
}: {
  size?: "xs" | "sm" | "default" | "lg";
  variant?: "default" | "light" | "dark" | "muted";
  className?: string;
}) => {
  const sizeClasses = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    default: "w-2 h-2",
    lg: "w-3 h-3",
  };

  const colorClasses = {
    default: "bg-primary",
    light: "bg-white",
    dark: "bg-gray-800",
    muted: "bg-gray-400",
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-pulse",
            sizeClasses[size],
            colorClasses[variant]
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );
};

// Loading overlay for pages/sections
export const LoadingOverlay = ({
  isLoading,
  children,
  className,
  loaderSize = "lg",
  message = "Loading...",
}: {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  loaderSize?: "sm" | "default" | "lg" | "xl";
  message?: string;
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Spinner size={loaderSize} />
          {message && (
            <p className="mt-4 text-sm text-muted-foreground font-medium">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Button loading state component
export const ButtonLoader = ({
  size = "sm",
  variant = "light",
  className,
}: {
  size?: "xs" | "sm" | "default";
  variant?: "default" | "light" | "dark" | "muted";
  className?: string;
}) => {
  return (
    <Spinner size={size} variant={variant} className={cn("mr-2", className)} />
  );
};
