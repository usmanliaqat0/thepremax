import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import { adminMiddleware } from "@/lib/admin-middleware";

// GET /api/admin/orders - Get all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await adminMiddleware(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Admin access required" },
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

    const query: any = {};

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

    // If all=true, get all orders without pagination
    let ordersQuery = Order.find(query).sort({ createdAt: -1 }).lean();

    if (!all) {
      ordersQuery = ordersQuery.skip(skip).limit(limit);
    }

    const [orders, total] = await Promise.all([
      ordersQuery,
      Order.countDocuments(query),
    ]);

    // Manually populate user data for orders that have valid ObjectId userIds
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        try {
          // Check if userId exists and is either a string or ObjectId
          if (order.userId) {
            // Import User model dynamically to avoid circular dependencies
            const { default: User } = await import("@/lib/models/User");
            const user = await User.findById(order.userId)
              .select("firstName lastName email")
              .lean();
            return { ...order, user };
          }
          return order;
        } catch (error) {
          // If user lookup fails, return order without user data
          console.log(`Failed to fetch user for order ${order._id}:`, error);
          return order;
        }
      })
    );

    // Get order statistics
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
    console.error("Admin orders API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
