import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Wishlist, { IWishlist } from "@/lib/models/Wishlist";
import { TokenUtils } from "@/lib/auth-service";
import mongoose from "mongoose";

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

    let wishlist = await (Wishlist as mongoose.Model<IWishlist>)
      .findOne({ userId: decoded.id })
      .lean();

    if (!wishlist) {
      const newWishlist = new (Wishlist as mongoose.Model<IWishlist>)({
        userId: decoded.id,
        items: [],
      });
      wishlist = (await newWishlist.save()) as unknown as typeof wishlist;
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

    let wishlist = await (Wishlist as mongoose.Model<IWishlist>).findOne({
      userId: decoded.id,
    });

    if (!wishlist) {
      wishlist = new Wishlist({ userId: decoded.id, items: [] });
    }

    if (action === "add" && item) {
      const existingItemIndex =
        wishlist?.items.findIndex(
          (existingItem: unknown) =>
            (existingItem as Record<string, unknown>).productId ===
            item.productId
        ) || -1;

      if (existingItemIndex === -1) {
        wishlist?.items.push({
          ...item,
          dateAdded: new Date(),
        });
      } else {
        if (
          wishlist?.items &&
          existingItemIndex >= 0 &&
          wishlist.items[existingItemIndex]
        ) {
          wishlist.items[existingItemIndex] = {
            ...wishlist.items[existingItemIndex],
            ...item,
            dateAdded: wishlist.items[existingItemIndex].dateAdded,
          };
        }
      }
    } else if (action === "remove" && productId) {
      if (wishlist?.items) {
        wishlist.items = wishlist.items.filter(
          (item: unknown) =>
            (item as Record<string, unknown>).productId !== productId
        );
      }
    }

    await wishlist?.save();

    return NextResponse.json({
      success: true,
      message:
        action === "add"
          ? "Item added to wishlist"
          : "Item removed from wishlist",
      wishlist: wishlist
        ? {
            id: (wishlist._id as unknown as { toString(): string }).toString(),
            userId: wishlist.userId,
            items: wishlist.items,
            createdAt: wishlist.createdAt,
            updatedAt: wishlist.updatedAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Update wishlist error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

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

    await (Wishlist as mongoose.Model<IWishlist>).findOneAndUpdate(
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
