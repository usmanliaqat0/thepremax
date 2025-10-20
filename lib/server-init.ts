/**
 * Server-side application initialization
 * This runs in Node.js runtime, not Edge Runtime
 */

import { auditEnvironmentSecurity } from "./env-validation";

// Global flag to ensure initialization only runs once per server instance
declare global {
  var __thepremax_server_initialized: boolean | undefined;
}

/**
 * Initializes the application with proper validation
 * This should be called once during server startup
 */
export function initializeServerApp(): void {
  // Check if already initialized
  if (global.__thepremax_server_initialized) {
    return;
  }

  try {
    console.log("🚀 Initializing ThePreMax server application...");

    // Audit environment security
    auditEnvironmentSecurity();

    // Mark as initialized
    global.__thepremax_server_initialized = true;
    console.log("✅ Server application initialization completed successfully");
  } catch (error) {
    console.error("❌ Server application initialization failed:");
    console.error(error);

    // In production, we might want to exit the process
    if (process.env.NODE_ENV === "production") {
      console.error(
        "💥 Fatal error: Application cannot start with invalid configuration"
      );
      process.exit(1);
    } else {
      console.warn("⚠️  Development mode: Continuing with warnings");
      // Still mark as initialized to prevent repeated attempts
      global.__thepremax_server_initialized = true;
    }
  }
}

/**
 * Gets the server initialization status
 */
export function isServerAppInitialized(): boolean {
  return global.__thepremax_server_initialized === true;
}

/**
 * Resets server initialization status (useful for testing)
 */
export function resetServerInitialization(): void {
  global.__thepremax_server_initialized = false;
}
