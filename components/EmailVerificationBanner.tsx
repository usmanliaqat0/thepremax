"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function EmailVerificationBanner() {
  const { state } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if user is not authenticated, email is verified, or user is admin
  if (
    !state.isAuthenticated ||
    !state.user ||
    state.user.isEmailVerified ||
    state.user.role === "admin" ||
    isDismissed
  ) {
    return null;
  }

  const resendVerificationEmail = async () => {
    if (!state.user?.email) return;

    setIsResending(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: state.user.email }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Verification email sent successfully!");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-4">
      <Mail className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 flex items-center justify-between">
        <div className="flex-1">
          <strong>Email Verification Required:</strong> Please verify your email
          address to access all features. Check your inbox for a verification
          email.
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={resendVerificationEmail}
            disabled={isResending}
            className="text-amber-700 border-amber-300 hover:bg-amber-100"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-3 w-3 mr-1" />
                Resend
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="text-amber-700 hover:bg-amber-100 p-1 h-8 w-8"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
