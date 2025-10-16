import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/lib/models/Category";
import mongoose from "mongoose";
import { handleApiError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    const categories = await Category.find(filter)
      .populate("productCount")
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch categories");
  }
}
