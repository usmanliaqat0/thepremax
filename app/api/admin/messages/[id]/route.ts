import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ContactMessage from "@/lib/models/ContactMessage";
import { AdminMiddleware } from "@/lib/admin-middleware";
import { z } from "zod";

// Validation schema for message updates
const updateMessageSchema = z.object({
  status: z.enum(["new", "read", "replied", "closed"]).optional(),
  adminNotes: z.string().max(1000, "Admin notes too long").optional(),
  repliedAt: z.date().optional(),
  closedAt: z.date().optional(),
});

// GET /api/admin/messages/[id] - Get single message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const message = await ContactMessage.findById(id).lean();

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Get message error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch message",
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/messages/[id] - Update message
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // Validate the request body
    const validationResult = updateMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Add timestamps for status changes
    if (updateData.status === "replied" && !updateData.repliedAt) {
      updateData.repliedAt = new Date();
    }
    if (updateData.status === "closed" && !updateData.closedAt) {
      updateData.closedAt = new Date();
    }

    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message,
      message: "Message updated successfully",
    });
  } catch (error) {
    console.error("Update message error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update message",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/messages/[id] - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const message = await ContactMessage.findByIdAndDelete(id);

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete message",
      },
      { status: 500 }
    );
  }
}
