import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import { adminMiddleware } from "@/lib/admin-middleware";
import { handleApiError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    const authResult = await adminMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.error || "Admin access required",
        },
        { status: authResult.status || 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const search = searchParams.get("search");
    const all = searchParams.get("all") === "true";

    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingAddress.firstName": { $regex: search, $options: "i" } },
        { "shippingAddress.lastName": { $regex: search, $options: "i" } },
        { "shippingAddress.email": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    let ordersQuery = Order.find(query).sort({ createdAt: -1 }).lean();

    if (!all) {
      ordersQuery = ordersQuery.skip(skip).limit(limit);
    }

    const [orders, total] = await Promise.all([
      ordersQuery,
      Order.countDocuments(query),
    ]);

    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        try {
          if (order.userId) {
            const { default: User } = await import("@/lib/models/User");
            const user = await User.findById(order.userId)
              .select("firstName lastName email")
              .lean();
            return { ...order, user };
          }
          return order;
        } catch (error) {
          console.log(`Failed to fetch user for order ${order._id}:`, error);
          return order;
        }
      })
    );

    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: all
        ? ordersWithUsers
        : {
            orders: ordersWithUsers,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            },
            stats: stats[0] || {
              totalOrders: 0,
              totalRevenue: 0,
              pendingOrders: 0,
              processingOrders: 0,
              shippedOrders: 0,
              deliveredOrders: 0,
              cancelledOrders: 0,
            },
          },
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch orders");
  }
}
