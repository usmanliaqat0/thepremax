import mongoose, { type Mongoose } from "mongoose";
import { getEnvConfig } from "./env-validation";
import { initializeServerApp } from "./server-init";
import { logInfo, logError, logDebug } from "./logger";

// Get environment configuration
const env = getEnvConfig();
const MONGODB_URI = env.MONGODB_URI;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

const mongooseStatic = mongoose as typeof mongoose & {
  connect: (
    uri: string,
    options?: Record<string, unknown>
  ) => Promise<Mongoose>;
  connection: {
    readyState: number;
    name?: string;
    host: string;
    port: number;
    db?: { databaseName: string };
    on: (event: string, callback: (error?: Error) => void) => void;
    removeAllListeners: (event: string) => void;
    close: () => Promise<void>;
  };
};

declare global {
  var mongooseCache: MongooseConnection | undefined;
}

const cached: MongooseConnection = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

interface MongoError extends Error {
  code?: number;
}

function isMongoError(error: unknown): error is MongoError {
  return error instanceof Error && "code" in error;
}

function getConnectionState(state: number): string {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[state as keyof typeof states] || "unknown";
}

/**
 * Establishes connection to MongoDB with optimized settings
 * Implements connection pooling and graceful error handling
 * @returns Promise<Mongoose> - The established MongoDB connection
 */
async function connectDB(): Promise<Mongoose> {
  // Initialize server application on first connection
  initializeServerApp();

  if (cached.conn && mongooseStatic.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const connectionOptions = {
      maxPoolSize: 20, // Increased for better concurrency
      minPoolSize: 5, // Increased minimum connections
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000, // Reduced for faster failover
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      bufferCommands: false,
      authSource: "admin",
      retryWrites: true,
      w: "majority",
      // Performance optimizations
      readPreference: "secondaryPreferred", // Use secondary for reads when available
      maxStalenessSeconds: 90, // Allow slightly stale reads for better performance
    };

    logInfo("Connecting to MongoDB...", "Database");
    cached.promise = mongooseStatic.connect(MONGODB_URI, connectionOptions);
  }

  try {
    cached.conn = await cached.promise;

    logInfo("Connected to MongoDB successfully", "Database");

    const connection = mongooseStatic.connection;
    logDebug(
      `Database: ${connection.name || connection.db?.databaseName || "N/A"}`,
      "Database"
    );
    logDebug(`Host: ${connection.host}:${connection.port}`, "Database");
    logDebug(
      `Ready State: ${getConnectionState(connection.readyState)}`,
      "Database"
    );

    setupConnectionEventHandlers();
    setupGracefulShutdown();

    return cached.conn!;
  } catch (error: unknown) {
    cached.promise = null;

    // const errorMessage =
    //   error instanceof Error ? error.message : "Unknown error";
    logError("MongoDB connection error", "Database", error as Error);
    logDebug(
      "Connection string being used:",
      "Database",
      MONGODB_URI.replace(/:[^:@]*@/, ":***@")
    );

    if (isMongoError(error)) {
      if (error.code === 18) {
        logError(
          "Authentication failed. Please check credentials and permissions",
          "Database"
        );
        logDebug(
          "Check: Username/password, database permissions, authSource options",
          "Database"
        );
      } else if (error.code === 8000) {
        logError(
          "Authentication failed due to authSource mismatch",
          "Database"
        );
      }
    }

    throw error;
  }
}

function setupConnectionEventHandlers(): void {
  const connection = mongooseStatic.connection;

  connection.removeAllListeners("connected");
  connection.removeAllListeners("error");
  connection.removeAllListeners("disconnected");
  connection.removeAllListeners("reconnected");

  connection.on("connected", () => {
    logInfo("MongoDB connection established", "Database");
  });

  connection.on("error", (err?: Error) => {
    logError("MongoDB connection error", "Database", err);
  });

  connection.on("disconnected", () => {
    logInfo("MongoDB disconnected", "Database");
    cached.conn = null;
  });

  connection.on("reconnected", () => {
    logInfo("MongoDB reconnected", "Database");
  });
}

// Graceful shutdown handler
function setupGracefulShutdown(): void {
  const gracefulShutdown = async (signal: string) => {
    logInfo(`Received ${signal}. Starting graceful shutdown...`, "Database");

    try {
      await disconnectDB();
      logInfo("Database connection closed gracefully", "Database");
      process.exit(0);
    } catch (error) {
      logError("Error during graceful shutdown", "Database", error as Error);
      process.exit(1);
    }
  };

  // Handle different termination signals
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2")); // For nodemon

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logError("Uncaught Exception", "Database", error);
    gracefulShutdown("uncaughtException");
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    logError(
      "Unhandled Rejection",
      "Database",
      new Error(`Promise: ${promise}, Reason: ${reason}`)
    );
    gracefulShutdown("unhandledRejection");
  });
}

/**
 * Gracefully closes the MongoDB connection
 * Cleans up cached connections and handles errors
 * @returns Promise<void>
 */
export async function disconnectDB(): Promise<void> {
  try {
    if (cached.conn) {
      await mongooseStatic.connection.close();
      cached.conn = null;
      cached.promise = null;
      logInfo("MongoDB connection closed", "Database");
    }
  } catch (error) {
    logError("Error closing MongoDB connection", "Database", error as Error);
    throw error;
  }
}

export function getConnectionStatus(): {
  isConnected: boolean;
  readyState: number;
  readyStateText: string;
} {
  const readyState = mongooseStatic.connection.readyState;
  return {
    isConnected: readyState === 1,
    readyState,
    readyStateText: getConnectionState(readyState),
  };
}

/**
 * Ensures database connection is healthy before operations
 * This is more efficient than calling connectDB() on every request
 * @returns Promise<boolean> - true if connection is healthy
 */
export async function ensureHealthyConnection(): Promise<boolean> {
  const status = getConnectionStatus();

  if (status.isConnected) {
    return true;
  }

  // Only attempt reconnection if we're not already connecting
  if (status.readyState === 2) {
    // Wait a bit for connection to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getConnectionStatus().isConnected;
  }

  // Attempt to reconnect if disconnected
  try {
    await connectDB();
    return getConnectionStatus().isConnected;
  } catch (error) {
    logError(
      "Failed to establish database connection",
      "Database",
      error as Error
    );
    return false;
  }
}

/**
 * Wrapper for database operations with automatic connection health check
 * Use this instead of calling connectDB() directly in API routes
 * @param operation - The database operation to perform
 * @returns Promise<T>
 */
export async function withDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  const isHealthy = await ensureHealthyConnection();

  if (!isHealthy) {
    throw new Error("Database connection is not available");
  }

  return await operation();
}

export default connectDB;
