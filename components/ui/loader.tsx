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
  message = "Loading",
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

// Beautiful comprehensive loader with text and animations
export const BeautifulLoader = ({
  size = "default",
  variant = "default",
  message = "Loading",
  showMessage = true,
  showDots = true,
  className,
}: {
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "default" | "light" | "dark" | "muted";
  message?: string;
  showMessage?: boolean;
  showDots?: boolean;
  className?: string;
}) => {
  const sizeClasses = {
    sm: { spinner: "w-6 h-6", text: "text-sm", container: "gap-3" },
    default: { spinner: "w-8 h-8", text: "text-base", container: "gap-4" },
    lg: { spinner: "w-12 h-12", text: "text-lg", container: "gap-5" },
    xl: { spinner: "w-16 h-16", text: "text-xl", container: "gap-6" },
  };

  const colorClasses = {
    default: "text-gray-600",
    light: "text-white",
    dark: "text-gray-800",
    muted: "text-gray-400",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        sizeClasses[size].container,
        className
      )}
    >
      <div className="relative">
        <Spinner size={size} variant={variant} />
        {/* Pulse ring animation */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-gray-200 animate-ping opacity-20",
            sizeClasses[size].spinner
          )}
        />
      </div>
      {showMessage && (
        <div
          className={cn(
            "flex items-center font-medium",
            sizeClasses[size].text,
            colorClasses[variant]
          )}
        >
          <span>{message}</span>
          {showDots && (
            <span className="ml-1">
              <span className="animate-pulse delay-0">.</span>
              <span className="animate-pulse delay-300">.</span>
              <span className="animate-pulse delay-700">.</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Full page beautiful loader
export const FullPageLoader = ({
  message = "Loading",
  subtitle,
  showLogo = false,
}: {
  message?: string;
  subtitle?: string;
  showLogo?: boolean;
}) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <div className="text-center space-y-6">
        {showLogo && (
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">TP</span>
            </div>
          </div>
        )}
        <BeautifulLoader
          size="lg"
          message={message}
          className="animate-fade-in"
        />
        {subtitle && (
          <p className="text-sm text-muted-foreground max-w-sm animate-fade-in delay-300">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
