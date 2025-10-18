import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order, { IOrder } from "@/lib/models/Order";
import { authMiddleware } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/error-handler";
import mongoose from "mongoose";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {
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
      (Order as mongoose.Model<IOrder>)
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Order as mongoose.Model<IOrder>).countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
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

export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
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
      promoCode,
      discount,
      shippingAddress,
      billingAddress,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Order items are required" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !billingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping and billing addresses are required",
        },
        { status: 400 }
      );
    }

    // Validate product IDs
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return NextResponse.json(
          { success: false, message: `Invalid product ID: ${item.productId}` },
          { status: 400 }
        );
      }
    }

    const orderNumber = generateOrderNumber();

    const order = new Order({
      userId: new mongoose.Types.ObjectId(user.id),
      orderNumber,
      items,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      promoCode,
      discount,
      shippingAddress,
      billingAddress,
      status: "pending",
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    });

    await order.save();

    // Update promo code usage if applied
    if (promoCode && promoCode.code) {
      try {
        const PromoCode = (await import("@/lib/models/PromoCode")).default;
        await PromoCode.findOneAndUpdate(
          { code: promoCode.code },
          { $inc: { usedCount: 1 } }
        );
      } catch (error) {
        console.error("Error updating promo code usage:", error);
        // Don't fail the order if promo code update fails
      }
    }

    return NextResponse.json(
      {
        success: true,
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
