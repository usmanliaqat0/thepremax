/**
 * Startup validation for the application
 * This module validates environment variables and other critical configurations at startup
 */

import { validateEnvironment } from "./env-validation";

/**
 * Validates all critical configurations at application startup
 * This should be called early in the application lifecycle
 */
export function validateStartup(): void {
  try {
    console.log("🔍 Validating application configuration...");

    // Validate environment variables
    validateEnvironment();

    console.log(
      "✅ Application configuration validation completed successfully"
    );
  } catch (error) {
    console.error("❌ Application startup validation failed:");
    console.error(error);
    process.exit(1);
  }
}

/**
 * Validates environment variables at startup
 * This allows the app to run with secure defaults if needed
 */
export function validateStartupForDevelopment(): void {
  try {
    console.log("🔍 Validating application configuration...");

    // Import the environment validation
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getEnvConfig } = require("./env-validation");

    // This will use secure defaults if environment variables are missing
    const config = getEnvConfig();

    console.log("✅ Configuration validation completed successfully");
    console.log(`📊 Using MongoDB: ${config.MONGODB_URI}`);
    console.log(`🔐 JWT Secret length: ${config.JWT_SECRET.length} characters`);
    console.log(`👤 Super Admin: ${config.SUPER_ADMIN_EMAIL}`);
  } catch (error) {
    console.error("❌ Startup validation failed:");
    console.error(error);
    process.exit(1);
  }
}
