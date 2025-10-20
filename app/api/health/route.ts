import { NextResponse } from "next/server";
import { getConnectionStatus } from "@/lib/db";
import { ApiResponseBuilder } from "@/lib/api-response";

export async function GET() {
  try {
    const dbStatus = getConnectionStatus();

    const healthData = {
      status: dbStatus.isConnected ? "healthy" : "unhealthy",
      database: {
        connected: dbStatus.isConnected,
        readyState: dbStatus.readyState,
        readyStateText: dbStatus.readyStateText,
      },
      timestamp: new Date().toISOString(),
    };

    if (dbStatus.isConnected) {
      return ApiResponseBuilder.success(healthData, "Service is healthy");
    } else {
      return ApiResponseBuilder.serviceUnavailable(
        "Service is unhealthy - database connection failed",
        undefined,
        JSON.stringify(healthData)
      );
    }
  } catch (error) {
    return ApiResponseBuilder.internalError(
      "Health check failed",
      error as Error
    );
  }
}
