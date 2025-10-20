// NextResponse is not needed as ApiResponseBuilder handles responses
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
        "Service is unhealthy - database connection failed"
      );
    }
  } catch (error) {
    return ApiResponseBuilder.internalError(
      "Health check failed",
      error as Error
    );
  }
}
