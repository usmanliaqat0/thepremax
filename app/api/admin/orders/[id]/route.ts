import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import { adminMiddleware } from "@/lib/admin-middleware";
import { handleApiError } from "@/lib/error-handler";

// GET /api/admin/orders/[id] - Get specific order (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await adminMiddleware(request);
    if (!user) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const order = await Order.findById(id)
      .populate("userId", "firstName lastName email phone")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
        { error: "Admin access required" },
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

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order
    const updateData: any = {};
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

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("userId", "firstName lastName email phone");

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
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to delete order");
  }
}
