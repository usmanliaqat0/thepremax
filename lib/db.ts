import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/thepremax";

if (!process.env.MONGODB_URI) {
  console.warn(
    "⚠️  MONGODB_URI environment variable not found. Using default local MongoDB connection."
  );
}

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Type assertion helper to access mongoose static properties
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

// Global variable to cache the connection
declare global {
  var mongooseCache: MongooseConnection | undefined;
}

// eslint-disable-next-line prefer-const
let cached: MongooseConnection = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

// Type guard for MongoDB errors
interface MongoError extends Error {
  code?: number;
}

function isMongoError(error: unknown): error is MongoError {
  return error instanceof Error && "code" in error;
}

// Helper function to get readable connection state
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
 * Global function to connect to MongoDB using Mongoose
 * Handles connection caching and error management
 */
async function connectDB(): Promise<Mongoose> {
  // Return existing connection if available
  if (cached.conn && mongooseStatic.connection.readyState === 1) {
    return cached.conn;
  }

  // Don't create multiple connection promises
  if (!cached.promise) {
    const connectionOptions = {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,

      // Connection timeout settings
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,

      // Performance settings
      bufferCommands: false,

      // Authentication
      authSource: "admin",

      // Other options for mongoose 8+
      retryWrites: true,
      w: "majority",
    };

    console.log("🔄 Connecting to MongoDB...");
    cached.promise = mongooseStatic.connect(MONGODB_URI, connectionOptions);
  }

  try {
    cached.conn = await cached.promise;

    console.log("✅ Connected to MongoDB successfully");

    // Log connection details
    const connection = mongooseStatic.connection;
    console.log(
      `📍 Database: ${connection.name || connection.db?.databaseName || "N/A"}`
    );
    console.log(`🔗 Host: ${connection.host}:${connection.port}`);
    console.log(`📊 Ready State: ${getConnectionState(connection.readyState)}`);

    // Set up connection event handlers
    setupConnectionEventHandlers();

    return cached.conn!;
  } catch (error: unknown) {
    // Reset promise on failure to allow retry
    cached.promise = null;

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ MongoDB connection error:", errorMessage);
    console.error(
      "🔍 Connection string being used:",
      MONGODB_URI.replace(/:[^:@]*@/, ":***@")
    );

    // Provide specific error guidance
    if (isMongoError(error)) {
      if (error.code === 18) {
        console.error("💡 Authentication failed. Please check:");
        console.error("   - Username and password are correct");
        console.error("   - Database name matches the user's permissions");
        console.error(
          "   - Try different authSource options (admin, database name, or none)"
        );
      } else if (error.code === 8000) {
        console.error("💡 Authentication failed due to authSource mismatch");
      }
    }

    throw error;
  }
}

/**
 * Set up connection event handlers for monitoring
 */
function setupConnectionEventHandlers(): void {
  const connection = mongooseStatic.connection;

  // Remove existing listeners to avoid duplicates
  connection.removeAllListeners("connected");
  connection.removeAllListeners("error");
  connection.removeAllListeners("disconnected");
  connection.removeAllListeners("reconnected");

  connection.on("connected", () => {
    console.log("🔌 MongoDB connection established");
  });

  connection.on("error", (err?: Error) => {
    console.error("❌ MongoDB connection error:", err);
  });

  connection.on("disconnected", () => {
    console.log("🔌 MongoDB disconnected");
    // Clear the cached connection on disconnect
    cached.conn = null;
  });

  connection.on("reconnected", () => {
    console.log("🔄 MongoDB reconnected");
  });
}

/**
 * Gracefully close the database connection
 */
export async function disconnectDB(): Promise<void> {
  try {
    if (cached.conn) {
      await mongooseStatic.connection.close();
      cached.conn = null;
      cached.promise = null;
      console.log("📴 MongoDB connection closed");
    }
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error);
    throw error;
  }
}

/**
 * Get the current connection status
 */
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

export default connectDB;
