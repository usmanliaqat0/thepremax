import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import EmailSubscription from "@/lib/models/EmailSubscription";
import { adminMiddleware } from "@/lib/admin-middleware";

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await adminMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const search = searchParams.get("search");

    // Build filter object
    const filter: Record<
      string,
      string | { $regex: string; $options: string }
    > = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (source && source !== "all") {
      filter.source = source;
    }

    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get subscriptions with pagination
    const subscriptions = await EmailSubscription.find(filter)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await EmailSubscription.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get statistics
    const stats = await EmailSubscription.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          unsubscribed: {
            $sum: { $cond: [{ $eq: ["$status", "unsubscribed"] }, 1, 0] },
          },
          bounced: {
            $sum: { $cond: [{ $eq: ["$status", "bounced"] }, 1, 0] },
          },
        },
      },
    ]);

    const sourceStats = await EmailSubscription.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: stats[0] || { total: 0, active: 0, unsubscribed: 0, bounced: 0 },
      sourceStats,
    });
  } catch (error) {
    console.error("Admin subscriptions fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await adminMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    const subscription = await EmailSubscription.findByIdAndDelete(id);

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error("Admin subscription delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await adminMiddleware(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status || 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Subscription ID and status are required" },
        { status: 400 }
      );
    }

    if (!["active", "unsubscribed", "bounced"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: Record<string, string | Date | undefined> = { status };

    if (status === "unsubscribed") {
      updateData.unsubscribedAt = new Date();
    } else if (status === "active") {
      updateData.unsubscribedAt = undefined;
    }

    const subscription = await EmailSubscription.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Subscription updated successfully",
      subscription,
    });
  } catch (error) {
    console.error("Admin subscription update error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
