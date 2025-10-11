import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import { handleApiError } from "@/lib/error-handler";

// GET /api/orders/track - Track order by order number
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (!orderNumber) {
      return NextResponse.json(
        { error: "Order number is required" },
        { status: 400 }
      );
    }

    // Find order by order number (without populate to avoid schema issues)
    const order = (await Order.findOne({ orderNumber })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .lean()) as unknown as any;

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Return order data (without sensitive information)
    const orderData = {
      _id: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    return handleApiError(error, "Failed to track order");
  }
}
