import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env file"
  );
}

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global variable to cache the connection
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
      authSource: "admin", // Specify the authentication database
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log("✅ Connected to MongoDB successfully");
    console.log(`📍 Database: ${cached.conn.connection.name}`);
    console.log(
      `🔗 Host: ${cached.conn.connection.host}:${cached.conn.connection.port}`
    );
    return cached.conn;
  } catch (error: any) {
    cached.promise = null;
    console.error("❌ MongoDB connection error:", error.message);
    console.error(
      "🔍 Connection string being used:",
      MONGODB_URI.replace(/:[^:@]*@/, ":***@")
    );

    // Provide helpful error messages
    if (error.code === 18) {
      console.error("💡 Authentication failed. Please check:");
      console.error("   - Username and password are correct");
      console.error("   - Database name matches the user's permissions");
      console.error(
        "   - Try different authSource options (admin, database name, or none)"
      );
    }

    throw error;
  }
}

export default connectDB;
