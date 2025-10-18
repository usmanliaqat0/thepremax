import { toast } from "sonner";
import { NextResponse } from "next/server";
import { AuthResponse } from "@/lib/types";
import { logError } from "./logger";

export interface ApiError {
  field?: string;
  message: string;
  type: "validation" | "auth" | "network" | "server";
}

// For API routes - returns NextResponse
export function handleApiError(
  error: unknown,
  defaultMessage: string = "Internal server error",
  statusCode?: number
): NextResponse {
  logError("API Error", "API", error as Error);

  let message = defaultMessage;
  let status = statusCode || 500;

  if (error instanceof Error) {
    // Handle database connection errors specifically
    if (
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("MongoNetworkError") ||
      error.message.includes("MongoServerError") ||
      error.message.includes("MongoTimeoutError") ||
      error.message.includes("connection")
    ) {
      message = "Database is temporarily unavailable. Please try again later.";
      status = 503; // Service Unavailable
    } else if (
      error.message.includes("authentication") &&
      error.message.includes("Mongo")
    ) {
      message = "Database authentication failed. Please contact support.";
      status = 503;
    } else {
      message = error.message;
    }
  } else if (typeof error === "string") {
    message = error;
  }

  // Determine status code based on error type if not explicitly provided
  if (!statusCode) {
    if (message.includes("not found")) {
      status = 404;
    } else if (message.includes("unauthorized") || message.includes("access")) {
      status = 401;
    } else if (message.includes("forbidden")) {
      status = 403;
    } else if (message.includes("validation") || message.includes("required")) {
      status = 400;
    } else if (
      message.includes("already exists") ||
      message.includes("duplicate")
    ) {
      status = 409;
    } else if (
      message.includes("not active") ||
      message.includes("deactivated")
    ) {
      status = 403;
    }
  }

  return NextResponse.json(
    {
      success: false,
      message: message,
    },
    { status }
  );
}

// For validation errors with detailed field information
export function handleValidationError(
  validationErrors: unknown[],
  defaultMessage: string = "Validation failed"
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: defaultMessage,
      details: validationErrors,
    },
    { status: 400 }
  );
}

// For client-side error handling - returns ApiError[]
export function handleClientError(
  response: AuthResponse,
  defaultMessage: string
): ApiError[] {
  const errors: ApiError[] = [];

  if (!response.success) {
    const message = response.message || defaultMessage;

    if (message.includes("email") && message.includes("required")) {
      errors.push({
        field: "email",
        message: "Email is required",
        type: "validation",
      });
    } else if (message.includes("password") && message.includes("required")) {
      errors.push({
        field: "password",
        message: "Password is required",
        type: "validation",
      });
    } else if (message.includes("first name") && message.includes("required")) {
      errors.push({
        field: "firstName",
        message: "First name is required",
        type: "validation",
      });
    } else if (message.includes("last name") && message.includes("required")) {
      errors.push({
        field: "lastName",
        message: "Last name is required",
        type: "validation",
      });
    } else if (message.includes("valid email")) {
      errors.push({
        field: "email",
        message: "Please enter a valid email address",
        type: "validation",
      });
    } else if (
      message.includes("password") &&
      (message.includes("length") || message.includes("characters"))
    ) {
      errors.push({ field: "password", message: message, type: "validation" });
    } else if (message.includes("already exists")) {
      errors.push({
        field: "email",
        message: "An account with this email already exists",
        type: "auth",
      });
    } else if (message.includes("No account found with this email address")) {
      errors.push({
        field: "email",
        message: "No account found with this email address",
        type: "auth",
      });
    } else if (message.includes("Incorrect password")) {
      errors.push({
        field: "password",
        message: "Incorrect password. Please try again.",
        type: "auth",
      });
    } else if (message.includes("Invalid email or password")) {
      // Fallback for any remaining generic messages
      errors.push({
        message:
          "Invalid email or password. Please check your credentials and try again.",
        type: "auth",
      });
    } else if (message.includes("Account is not active")) {
      errors.push({
        message: "Your account has been deactivated. Please contact support.",
        type: "auth",
      });
    } else {
      errors.push({ message: message, type: "server" });
    }
  }

  return errors;
}

export function displayApiErrors(errors: ApiError[]): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  errors.forEach((error) => {
    if (error.field) {
      fieldErrors[error.field] = error.message;
    } else {
      toast.error(error.message);
    }
  });

  return fieldErrors;
}

export function showSuccessMessage(message: string) {
  toast.success(message);
}

export function showErrorMessage(message: string) {
  toast.error(message);
}
