import { NextResponse } from "next/server";
import { getEnvConfig } from "@/lib/env-validation";
import { getConnectionStatus } from "@/lib/db";

export async function GET() {
  // Only allow in development or with a special debug key
  const isDevelopment = process.env.NODE_ENV === "development";
  const debugKey = process.env.DEBUG_KEY;
  const providedKey = new URL(
    process.env.NEXT_PUBLIC_APP_URL + "/api/debug"
  ).searchParams.get("key");

  if (!isDevelopment && (!debugKey || providedKey !== debugKey)) {
    return NextResponse.json(
      { error: "Debug endpoint not available" },
      { status: 404 }
    );
  }

  try {
    const env = getEnvConfig();
    const dbStatus = getConnectionStatus();

    const debugInfo = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        isProduction: process.env.NODE_ENV === "production",
      },
      database: {
        connected: dbStatus.isConnected,
        readyState: dbStatus.readyState,
        readyStateText: dbStatus.readyStateText,
        hasMongoUri: !!env.MONGODB_URI,
        mongoUriPrefix: env.MONGODB_URI?.substring(0, 20) + "...",
      },
      config: {
        hasJwtSecret: !!env.JWT_SECRET,
        hasJwtRefreshSecret: !!env.JWT_REFRESH_SECRET,
        hasSuperAdminEmail: !!env.SUPER_ADMIN_EMAIL,
        hasSuperAdminPassword: !!env.SUPER_ADMIN_PASSWORD,
        appUrl: env.NEXT_PUBLIC_APP_URL,
        appName: env.NEXT_PUBLIC_APP_NAME,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Debug info failed",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
