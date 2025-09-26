import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ContactMessage from "@/lib/models/ContactMessage";
import { AdminMiddleware } from "@/lib/admin-middleware";

// GET /api/admin/messages - Get all contact messages with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    // Get total count
    const total = await ContactMessage.countDocuments(filter);

    // Get messages with sorting
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}
