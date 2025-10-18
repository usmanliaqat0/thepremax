import crypto from "crypto";

/**
 * Environment variable validation and configuration management
 * Provides centralized, type-safe access to environment variables with proper validation
 */

interface EnvironmentConfig {
  // Database
  MONGODB_URI: string;

  // JWT Configuration
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;

  // Admin Configuration
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;

  // Email Service
  BREVO_API_KEY?: string;
  BREVO_SENDER_NAME?: string;
  BREVO_SENDER_EMAIL?: string;
  BREVO_PASSWORD_RESET_TEMPLATE_ID?: string;
  BREVO_EMAIL_VERIFICATION_TEMPLATE_ID?: string;
  BREVO_WELCOME_TEMPLATE_ID?: string;

  // App Configuration
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_APP_NAME?: string;

  // Node Environment
  NODE_ENV: string;
}

class EnvironmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvironmentValidationError";
  }
}

/**
 * Generates a cryptographically secure random string for JWT secrets
 */
function generateSecureSecret(length: number = 64): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Validates and loads environment variables
 * Throws EnvironmentValidationError if required variables are missing
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  const errors: string[] = [];

  // Required environment variables
  const requiredVars = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    NODE_ENV: process.env.NODE_ENV || "development",
  };

  // Check for missing required variables
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  }

  // Validate JWT secrets strength
  if (requiredVars.JWT_SECRET && requiredVars.JWT_SECRET.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters long for security");
  }

  if (
    requiredVars.JWT_REFRESH_SECRET &&
    requiredVars.JWT_REFRESH_SECRET.length < 32
  ) {
    errors.push(
      "JWT_REFRESH_SECRET must be at least 32 characters long for security"
    );
  }

  // Validate email format
  if (
    requiredVars.SUPER_ADMIN_EMAIL &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requiredVars.SUPER_ADMIN_EMAIL)
  ) {
    errors.push("SUPER_ADMIN_EMAIL must be a valid email address");
  }

  // Validate password strength
  if (
    requiredVars.SUPER_ADMIN_PASSWORD &&
    requiredVars.SUPER_ADMIN_PASSWORD.length < 12
  ) {
    errors.push(
      "SUPER_ADMIN_PASSWORD must be at least 12 characters long for security"
    );
  }

  // Validate MongoDB URI format
  if (
    requiredVars.MONGODB_URI &&
    !requiredVars.MONGODB_URI.startsWith("mongodb://") &&
    !requiredVars.MONGODB_URI.startsWith("mongodb+srv://")
  ) {
    errors.push("MONGODB_URI must be a valid MongoDB connection string");
  }

  if (errors.length > 0) {
    throw new EnvironmentValidationError(
      `Environment validation failed:\n${errors
        .map((e) => `  - ${e}`)
        .join("\n")}\n\n` +
        "Please check your .env file and ensure all required variables are set with valid values."
    );
  }

  // Optional environment variables with defaults
  const config: EnvironmentConfig = {
    // Required variables
    MONGODB_URI: requiredVars.MONGODB_URI!,
    JWT_SECRET: requiredVars.JWT_SECRET!,
    JWT_REFRESH_SECRET: requiredVars.JWT_REFRESH_SECRET!,
    SUPER_ADMIN_EMAIL: requiredVars.SUPER_ADMIN_EMAIL!,
    SUPER_ADMIN_PASSWORD: requiredVars.SUPER_ADMIN_PASSWORD!,
    NODE_ENV: requiredVars.NODE_ENV,

    // Optional variables with defaults
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    BREVO_API_KEY: process.env.BREVO_API_KEY || "",
    BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || "",
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || "",
    BREVO_PASSWORD_RESET_TEMPLATE_ID:
      process.env.BREVO_PASSWORD_RESET_TEMPLATE_ID || "",
    BREVO_EMAIL_VERIFICATION_TEMPLATE_ID:
      process.env.BREVO_EMAIL_VERIFICATION_TEMPLATE_ID || "",
    BREVO_WELCOME_TEMPLATE_ID: process.env.BREVO_WELCOME_TEMPLATE_ID || "",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "ThePreMax",
  };

  return config;
}

/**
 * Gets environment configuration with fallback to secure defaults
 * This provides sensible defaults when environment variables are missing
 */
export function loadEnvironmentConfigWithDefaults(): EnvironmentConfig {
  console.warn(
    "⚠️  Some environment variables are missing, using secure defaults"
  );

  return {
    MONGODB_URI:
      process.env.MONGODB_URI || "mongodb://localhost:27017/thepremax",
    JWT_SECRET: process.env.JWT_SECRET || generateSecureSecret(),
    JWT_REFRESH_SECRET:
      process.env.JWT_REFRESH_SECRET || generateSecureSecret(),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || "admin@thepremax.com",
    SUPER_ADMIN_PASSWORD:
      process.env.SUPER_ADMIN_PASSWORD || generateSecureSecret(16),
    BREVO_API_KEY: process.env.BREVO_API_KEY || "",
    BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || "",
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || "",
    BREVO_PASSWORD_RESET_TEMPLATE_ID:
      process.env.BREVO_PASSWORD_RESET_TEMPLATE_ID || "",
    BREVO_EMAIL_VERIFICATION_TEMPLATE_ID:
      process.env.BREVO_EMAIL_VERIFICATION_TEMPLATE_ID || "",
    BREVO_WELCOME_TEMPLATE_ID: process.env.BREVO_WELCOME_TEMPLATE_ID || "",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "ThePreMax",
    NODE_ENV: process.env.NODE_ENV || "development",
  };
}

/**
 * Singleton instance of environment configuration
 * Loads once and caches the result
 */
let envConfig: EnvironmentConfig | null = null;

export function getEnvConfig(): EnvironmentConfig {
  if (!envConfig) {
    try {
      // Try strict validation first
      envConfig = loadEnvironmentConfig();
    } catch {
      // If validation fails, use defaults with warning
      console.warn("⚠️  Environment validation failed, using secure defaults");
      envConfig = loadEnvironmentConfigWithDefaults();
    }
  }
  return envConfig;
}

/**
 * Validates that all required environment variables are present
 * Call this at application startup to fail fast if configuration is invalid
 */
export function validateEnvironment(): void {
  try {
    loadEnvironmentConfig();
    console.log("✅ Environment validation passed");
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.error("❌ Environment validation failed:");
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}

export { EnvironmentValidationError };
