import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order, { IOrder } from "@/lib/models/Order";
import { adminMiddleware } from "@/lib/admin-middleware";
import { handleApiError } from "@/lib/error-handler";
import mongoose from "mongoose";

// GET /api/admin/orders/[id] - Get specific order (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await adminMiddleware(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const order = await (Order as mongoose.Model<IOrder>)
      .findById(id)
      .populate("userId", "firstName lastName email phone")
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

// PUT /api/admin/orders/[id] - Update order (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await adminMiddleware(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const {
      status,
      paymentStatus,
      trackingNumber,
      estimatedDelivery,
      shippingAddress,
      billingAddress,
    } = body;

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

    // Update order
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery)
      updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (shippingAddress) updateData.shippingAddress = shippingAddress;
    if (billingAddress) updateData.billingAddress = billingAddress;

    // If order is delivered, set deliveredAt
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await (Order as mongoose.Model<IOrder>)
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .populate("userId", "firstName lastName email phone");

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    return handleApiError(error, "Failed to update order");
  }
}

// DELETE /api/admin/orders/[id] - Delete order (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await adminMiddleware(request);
    if (!user) {
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
