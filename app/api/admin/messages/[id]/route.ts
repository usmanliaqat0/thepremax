import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import connectDB from "@/lib/db";
import ContactMessage from "@/lib/models/ContactMessage";
import { AdminMiddleware } from "@/lib/admin-middleware";
import { z } from "zod";

const updateMessageSchema = z.object({
  status: z.enum(["new", "read", "replied", "closed"]).optional(),
  adminNotes: z.string().max(1000, "Admin notes too long").optional(),
  repliedAt: z.date().optional(),
  closedAt: z.date().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    const message = await ContactMessage.findById(id).lean();

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message not found",
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
      { success: false, message: "Failed to fetch message",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const validationResult = updateMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

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
        { success: false, message: "Message not found",
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
      { success: false, message: "Failed to update message",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    const message = await ContactMessage.findByIdAndDelete(id);

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message not found",
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
      { success: false, message: "Failed to delete message",
      },
      { status: 500 }
    );
  }
}
