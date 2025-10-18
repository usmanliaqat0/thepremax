/**
 * Database connection utilities with enhanced error handling
 */

import connectDB from "./db";

export interface DatabaseConnectionResult {
  success: boolean;
  error?: string;
}

/**
 * Ensures database connection with specific error handling
 * @returns Promise<DatabaseConnectionResult>
 */
export async function ensureDatabaseConnection(): Promise<DatabaseConnectionResult> {
  try {
    await connectDB();
    return { success: true };
  } catch (error) {
    console.error("Database connection failed:", error);

    if (error instanceof Error) {
      // Handle specific MongoDB connection errors
      if (error.message.includes("ECONNREFUSED")) {
        return {
          success: false,
          error: "Database server is unavailable. Please try again later.",
        };
      } else if (
        error.message.includes("authentication") ||
        error.message.includes("authSource")
      ) {
        return {
          success: false,
          error: "Database authentication failed. Please contact support.",
        };
      } else if (
        error.message.includes("timeout") ||
        error.message.includes("MongoTimeoutError")
      ) {
        return {
          success: false,
          error: "Database connection timeout. Please try again later.",
        };
      } else if (error.message.includes("MongoNetworkError")) {
        return {
          success: false,
          error:
            "Database network error. Please check your connection and try again.",
        };
      } else if (error.message.includes("MongoServerError")) {
        return {
          success: false,
          error: "Database server error. Please try again later.",
        };
      }
    }

    return {
      success: false,
      error: "Database connection failed. Please try again later.",
    };
  }
}

/**
 * Wrapper for database operations with connection error handling
 * @param operation - The database operation to perform
 * @returns Promise<T>
 */
export async function withDatabaseConnection<T>(
  operation: () => Promise<T>
): Promise<T> {
  const connectionResult = await ensureDatabaseConnection();

  if (!connectionResult.success) {
    throw new Error(connectionResult.error);
  }

  return await operation();
}
