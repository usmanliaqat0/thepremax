import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import { authMiddleware } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/error-handler";
import mongoose from "mongoose";

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
}

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    // Handle both string and ObjectId userIds
    const query: any = {
      $or: [
        { userId: user.id },
        { userId: new mongoose.Types.ObjectId(user.id) },
      ],
    };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch orders");
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    const {
      items,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      shippingAddress,
      billingAddress,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order items are required" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !billingAddress) {
      return NextResponse.json(
        { error: "Shipping and billing addresses are required" },
        { status: 400 }
      );
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber();

    // Create order
    const order = new Order({
      userId: new mongoose.Types.ObjectId(user.id),
      orderNumber,
      items,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      shippingAddress,
      billingAddress,
      status: "pending",
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    });

    await order.save();

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to create order");
  }
}
