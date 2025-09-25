import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Wishlist from "@/lib/models/Wishlist";
import { TokenUtils } from "@/lib/auth-service";

// Get user wishlist
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = TokenUtils.verifyAccessToken(token);

    await connectDB();

    let wishlist = await Wishlist.findOne({ userId: decoded.id }).lean();

    // Create empty wishlist if none exists
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: decoded.id, items: [] });
    }

    return NextResponse.json({
      success: true,
      wishlist: wishlist
        ? {
            id: (wishlist as Record<string, unknown>)._id?.toString(),
            userId: (wishlist as Record<string, unknown>).userId,
            items: (wishlist as Record<string, unknown>).items || [],
            createdAt: (wishlist as Record<string, unknown>).createdAt,
            updatedAt: (wishlist as Record<string, unknown>).updatedAt,
          }
        : {
            id: "",
            userId: decoded.id,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    if (
      error instanceof Error &&
      error.message === "Invalid or expired token"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add item to wishlist or update wishlist
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = TokenUtils.verifyAccessToken(token);
    const { action, item, productId } = await req.json();

    await connectDB();

    let wishlist = await Wishlist.findOne({ userId: decoded.id });

    // Create wishlist if none exists
    if (!wishlist) {
      wishlist = new Wishlist({ userId: decoded.id, items: [] });
    }

    if (action === "add" && item) {
      // Check if item already exists
      const existingItemIndex = wishlist.items.findIndex(
        (existingItem: Record<string, unknown>) =>
          existingItem.productId === item.productId
      );

      if (existingItemIndex === -1) {
        // Add new item
        wishlist.items.push({
          ...item,
          dateAdded: new Date(),
        });
      } else {
        // Update existing item
        wishlist.items[existingItemIndex] = {
          ...wishlist.items[existingItemIndex],
          ...item,
          dateAdded: wishlist.items[existingItemIndex].dateAdded, // Preserve original date
        };
      }
    } else if (action === "remove" && productId) {
      // Remove item
      wishlist.items = wishlist.items.filter(
        (item: Record<string, unknown>) => item.productId !== productId
      );
    }

    await wishlist.save();

    return NextResponse.json({
      success: true,
      message:
        action === "add"
          ? "Item added to wishlist"
          : "Item removed from wishlist",
      wishlist: {
        id: wishlist._id.toString(),
        userId: wishlist.userId,
        items: wishlist.items,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Clear entire wishlist
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = TokenUtils.verifyAccessToken(token);

    await connectDB();

    await Wishlist.findOneAndUpdate(
      { userId: decoded.id },
      { items: [] },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
