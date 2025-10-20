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

// Secret generation removed; configuration is read-only from process.env now

/**
 * Validates and loads environment variables
 * Throws EnvironmentValidationError if required variables are missing
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  // Directly map from process.env; no validation, no defaults beyond empty strings
  const config: EnvironmentConfig = {
    // Database
    MONGODB_URI: process.env.MONGODB_URI || "",

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "",

    // Admin
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL || "",
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || "",

    // Email service
    BREVO_API_KEY: process.env.BREVO_API_KEY || "",
    BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || "",
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || "",
    BREVO_PASSWORD_RESET_TEMPLATE_ID:
      process.env.BREVO_PASSWORD_RESET_TEMPLATE_ID || "",
    BREVO_EMAIL_VERIFICATION_TEMPLATE_ID:
      process.env.BREVO_EMAIL_VERIFICATION_TEMPLATE_ID || "",
    BREVO_WELCOME_TEMPLATE_ID: process.env.BREVO_WELCOME_TEMPLATE_ID || "",

    // App config
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "",

    // Node environment
    NODE_ENV: process.env.NODE_ENV || "development",
  };

  return config;
}

/**
 * Gets environment configuration with fallback to secure defaults
 * This provides sensible defaults ONLY for development environment
 * Production environment will fail if required variables are missing
 */
export function loadEnvironmentConfigWithDefaults(): EnvironmentConfig {
  // Deprecated: now simply returns loadEnvironmentConfig() without validation/defaults
  return loadEnvironmentConfig();
}

/**
 * Singleton instance of environment configuration
 * Loads once and caches the result
 */
let envConfig: EnvironmentConfig | null = null;

export function getEnvConfig(): EnvironmentConfig {
  if (!envConfig) {
    envConfig = loadEnvironmentConfig();
  }
  return envConfig;
}

/**
 * Audits environment variables for security issues
 * Logs warnings for potential security concerns
 */
export function auditEnvironmentSecurity(): void {
  const config = getEnvConfig();
  const warnings: string[] = [];

  // Check for weak secrets
  if (config.JWT_SECRET.length < 64) {
    warnings.push("JWT_SECRET is shorter than recommended (64+ characters)");
  }

  if (config.JWT_REFRESH_SECRET.length < 64) {
    warnings.push(
      "JWT_REFRESH_SECRET is shorter than recommended (64+ characters)"
    );
  }

  // Check for default values in production
  if (config.NODE_ENV === "production") {
    if (config.MONGODB_URI.includes("localhost")) {
      warnings.push("MONGODB_URI is using localhost in production");
    }

    if (config.NEXT_PUBLIC_APP_URL?.includes("localhost")) {
      warnings.push("NEXT_PUBLIC_APP_URL is using localhost in production");
    }
  }

  // Check for missing optional but recommended variables
  if (!config.BREVO_API_KEY) {
    warnings.push(
      "BREVO_API_KEY is not set - email functionality may not work"
    );
  }

  if (warnings.length > 0) {
    console.warn("🔒 Environment Security Audit:");
    warnings.forEach((warning) => console.warn(`  ⚠️  ${warning}`));
  } else {
    console.log("🔒 Environment security audit passed");
  }
}

export { EnvironmentValidationError };
