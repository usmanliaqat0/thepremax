import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order, { IOrder } from "@/lib/models/Order";
import { authMiddleware } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/error-handler";
import mongoose from "mongoose";

// GET /api/orders/[id] - Get specific order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const order = await (Order as mongoose.Model<IOrder>)
      .findOne({
        _id: id,
        userId: user.id,
      })
      .lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error, "Failed to fetch order");
  }
}

// PUT /api/orders/[id] - Update order (for admin or order cancellation)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, trackingNumber, estimatedDelivery } = body;

    // Check if user is admin or order owner
    const order = await (Order as mongoose.Model<IOrder>).findById(id);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Regular users can only cancel their own orders
    if (user.role !== "admin" && order.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 403 }
      );
    }

    // Regular users can only cancel pending orders
    if (user.role !== "admin" && status && status !== "cancelled") {
      return NextResponse.json(
        {
          success: false,
          message: "You can only cancel orders",
        },
        { status: 403 }
      );
    }

    if (user.role !== "admin" && order.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot cancel order that is already processed",
        },
        { status: 400 }
      );
    }

    // Update order
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery)
      updateData.estimatedDelivery = new Date(estimatedDelivery);

    // If order is delivered, set deliveredAt
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await (Order as mongoose.Model<IOrder>)
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .lean();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    return handleApiError(error, "Failed to update order");
  }
}

// DELETE /api/orders/[id] - Delete order (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const order = await (Order as mongoose.Model<IOrder>).findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to delete order");
  }
}
