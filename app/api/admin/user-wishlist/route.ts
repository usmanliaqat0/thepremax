import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Wishlist from "@/lib/models/Wishlist";
import { TokenUtils } from "@/lib/auth-service";

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

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const wishlist = await Wishlist.findOne({ userId }).lean();

    if (!wishlist) {
      return NextResponse.json({
        success: true,
        wishlist: {
          id: "",
          userId: userId,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      wishlist: {
        id: (wishlist as Record<string, unknown>)._id?.toString(),
        userId: (wishlist as Record<string, unknown>).userId,
        items: (wishlist as Record<string, unknown>).items || [],
        createdAt: (wishlist as Record<string, unknown>).createdAt,
        updatedAt: (wishlist as Record<string, unknown>).updatedAt,
      },
    });
  } catch (error) {
    console.error("Get user wishlist error:", error);
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
