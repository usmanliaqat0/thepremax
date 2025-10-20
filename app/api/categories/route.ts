import { NextRequest, NextResponse } from "next/server";
import { withDatabaseOperation } from "@/lib/db";
import Category from "@/lib/models/Category";
import mongoose from "mongoose";
import { ApiResponseBuilder } from "@/lib/api-response";
import { logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    // Use the database operation wrapper for better error handling
    const categories = await withDatabaseOperation(async () => {
      // Ensure Product model is registered for virtual population
      if (!mongoose.models.Product) {
        await import("@/lib/models/Product");
      }

      const { searchParams } = new URL(request.url);
      const includeInactive = searchParams.get("includeInactive") === "true";

      const filter: Record<string, unknown> = {};

      if (!includeInactive) {
        filter.status = "active";
      }

      return await Category.find(filter)
        .populate("productCount")
        .sort({ order: 1, createdAt: -1 })
        .lean();
    });

    return ApiResponseBuilder.success(
      categories,
      "Categories fetched successfully"
    );
  } catch (error) {
    logError("Failed to fetch categories", "API", error as Error);

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      error.message.includes("Database connection is not available")
    ) {
      return ApiResponseBuilder.serviceUnavailable(
        "Database is temporarily unavailable. Please try again later."
      );
    }

    return ApiResponseBuilder.internalError(
      "Failed to fetch categories",
      error as Error
    );
  }
}
