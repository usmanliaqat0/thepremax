"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const verifyEmail = useCallback(
    async (verificationToken: string) => {
      setIsVerifying(true);
      setVerificationStatus("pending");

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: verificationToken }),
        });

        const result = await response.json();

        if (result.success) {
          setVerificationStatus("success");
          setMessage(result.message);
          toast.success("Email verified successfully!");

setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setVerificationStatus("error");
          setMessage(result.message);
          toast.error(result.message);
        }
      } catch {
        setVerificationStatus("error");
        setMessage("Failed to verify email. Please try again.");
        toast.error("Failed to verify email. Please try again.");
      } finally {
        setIsVerifying(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Verification email sent successfully!");
        setMessage("A new verification email has been sent to your inbox.");
      } else {
        toast.error(result.message);
        setMessage(result.message);
      }
    } catch {
      toast.error("Failed to resend verification email");
      setMessage("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case "error":
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Mail className="h-12 w-12 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isVerifying ? (
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              ) : (
                getStatusIcon()
              )}
            </div>
            <CardTitle className={`text-2xl font-bold ${getStatusColor()}`}>
              {isVerifying
                ? "Verifying Email..."
                : verificationStatus === "success"
                ? "Email Verified!"
                : verificationStatus === "error"
                ? "Verification Failed"
                : "Email Verification"}
            </CardTitle>
            <CardDescription>
              {isVerifying
                ? "Please wait while we verify your email address"
                : verificationStatus === "success"
                ? "Your email has been successfully verified. You will be redirected to the login page shortly."
                : verificationStatus === "error"
                ? "We couldn't verify your email address. Please try again or request a new verification email."
                : "Click the verification link in your email to verify your account"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <Alert
                className={
                  verificationStatus === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-green-200 bg-green-50"
                }
              >
                <AlertDescription
                  className={
                    verificationStatus === "error"
                      ? "text-red-800"
                      : "text-green-800"
                  }
                >
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === "error" && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter your email address to resend verification
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email address"
                  />
                </div>

                <Button
                  onClick={resendVerificationEmail}
                  disabled={isResending || !email}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>
            )}

            {verificationStatus === "success" && (
              <div className="text-center">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {verificationStatus === "pending" && !token && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  No verification token found. Please check your email and click
                  the verification link.
                </p>
                <Button
                  onClick={() => router.push("/login")}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading verification page...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
