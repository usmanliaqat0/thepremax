"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error!}
            reset={() => this.setState({ hasError: false, error: undefined })}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          reset={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  reset,
}) => {
  return (
    <Card className="m-4 border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          We're sorry, but something unexpected happened. Please try refreshing
          the page.
        </p>
        {process.env.NODE_ENV === "development" && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">
              Error details
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
        <Button onClick={reset} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
};

// High-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
};

// Product-specific error boundary
export const ProductErrorFallback: React.FC<ErrorFallbackProps> = ({
  reset,
}) => {
  return (
    <Card className="h-full border-destructive/50">
      <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Failed to load product
        </p>
        <Button size="sm" variant="outline" onClick={reset}>
          <RefreshCw className="mr-1 h-3 w-3" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
};
