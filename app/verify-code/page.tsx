"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Mail,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

function VerifyCodeContent() {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isCooldownChecked, setIsCooldownChecked] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const codeFromUrl = searchParams.get("code");

  const verifyEmailWithToken = useCallback(
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

          localStorage.removeItem("pending_verification_email");

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

  const verifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsVerifying(true);
    setVerificationStatus("pending");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationCode }),
      });

      const result = await response.json();

      if (result.success) {
        setVerificationStatus("success");
        setMessage(result.message);
        toast.success("Email verified successfully!");

        localStorage.removeItem("pending_verification_email");

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
  };

  const resendVerificationEmail = async () => {
    if (!email) {
      toast.error("Email not found. Please try signing up again.");
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
        setVerificationStatus("pending");

        const cooldownTime = Date.now() + 2 * 60 * 1000;
        localStorage.setItem("resend_cooldown", cooldownTime.toString());
        setResendCooldown(120);
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

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const storedEmail = localStorage.getItem("pending_verification_email");

    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem("pending_verification_email", emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }

    if (token) {
      verifyEmailWithToken(token);
    } else {
      if (codeFromUrl) {
        setVerificationCode(codeFromUrl);
      }

      const storedCooldown = localStorage.getItem("resend_cooldown");
      if (storedCooldown) {
        const cooldownTime = parseInt(storedCooldown);
        const remainingTime = Math.max(0, cooldownTime - Date.now());
        if (remainingTime > 0) {
          setResendCooldown(Math.ceil(remainingTime / 1000));
        }
      }

      setIsCooldownChecked(true);
    }
  }, [searchParams, token, codeFromUrl, verifyEmailWithToken]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCooldown === 0) {
      localStorage.removeItem("resend_cooldown");
    }
    return undefined;
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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

  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">{getStatusIcon()}</div>
              <CardTitle className={`text-2xl font-bold ${getStatusColor()}`}>
                Email Verified!
              </CardTitle>
              <CardDescription>
                Your email has been successfully verified. You will be
                redirected to the login page shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push("/login")} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              {isVerifying ? "Verifying..." : "Verify Your Email"}
            </CardTitle>
            <CardDescription>
              {isVerifying
                ? "Please wait while we verify your email address"
                : "We've sent a verification code to your email address. Please enter it below to verify your account."}
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

            {(verificationStatus === "pending" ||
              verificationStatus === "error") && (
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="verificationCode"
                    className="text-sm font-medium"
                  >
                    Verification Code
                  </Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="mt-1"
                    disabled={isVerifying}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Check your email for the verification code
                  </p>
                </div>

                <Button
                  onClick={verifyCode}
                  disabled={isVerifying || !verificationCode.trim()}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn&apos;t receive the code?
                  </p>
                  <Button
                    onClick={resendVerificationEmail}
                    disabled={
                      !isCooldownChecked || isResending || resendCooldown > 0
                    }
                    variant="outline"
                    className="w-full"
                  >
                    {!isCooldownChecked ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : isResending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : resendCooldown > 0 ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend in {formatTime(resendCooldown)}
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Code
                      </>
                    )}
                  </Button>
                  {!isCooldownChecked ? (
                    <p className="text-xs text-gray-500 mt-2">
                      Checking resend availability...
                    </p>
                  ) : resendCooldown > 0 ? (
                    <p className="text-xs text-gray-500 mt-2">
                      Please wait {formatTime(resendCooldown)} before requesting
                      another code
                    </p>
                  ) : null}
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => router.push("/signup")}
                    variant="ghost"
                    className="text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Signup
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          </div>
        </div>
      }
    >
      <VerifyCodeContent />
    </Suspense>
  );
}
