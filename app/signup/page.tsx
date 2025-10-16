"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ButtonLoader } from "@/components/ui/loader";
import { AuthPageLoader } from "@/components/ui/auth-loader";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { state, signupForm, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect authenticated users away from signup page
  useEffect(() => {
    if (!state.isLoading && state.isAuthenticated && state.user) {
      // If user is admin, redirect to admin dashboard
      if (isAdmin()) {
        router.push("/admin");
      } else {
        // Regular users go to profile
        router.push("/profile");
      }
    }
  }, [state.isLoading, state.isAuthenticated, state.user, isAdmin, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don&apos;t match";
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Please agree to terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signupForm({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (result.success) {
        router.push("/profile");
      } else if (result.errors) {
        setErrors((prev) => ({ ...prev, ...result.errors }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Show loading while checking authentication status
  if (state.isLoading) {
    return <AuthPageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6 px-4 sm:px-6">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-center text-gray-600 text-sm sm:text-base">
                Join ThePreMax and discover premium fashion
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="firstName"
                      className="text-gray-700 font-medium mb-2 block"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`h-11 ${
                        errors.firstName
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-gray-400"
                      } transition-colors`}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="lastName"
                      className="text-gray-700 font-medium mb-2 block"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`h-11 ${
                        errors.lastName
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 focus:border-gray-400"
                      } transition-colors`}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="email"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`h-11 ${
                      errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-400"
                    } transition-colors`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    Password
                  </Label>
                  <PasswordInput
                    id="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`h-11 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-400"
                    } transition-colors`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-700 font-medium mb-2 block"
                  >
                    Confirm Password
                  </Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={`h-11 ${
                      errors.confirmPassword
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-400"
                    } transition-colors`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        handleInputChange("agreeToTerms", !!checked)
                      }
                      className="mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor="agreeToTerms"
                        className="text-sm text-gray-700 leading-relaxed cursor-pointer block"
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-gray-900 hover:text-gray-700 underline font-semibold transition-colors"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-gray-900 hover:text-gray-700 underline font-semibold transition-colors"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-sm text-red-500 mt-2 ml-7">
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting && <ButtonLoader variant="light" />}
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                    >
                      Sign in here
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Signup;
