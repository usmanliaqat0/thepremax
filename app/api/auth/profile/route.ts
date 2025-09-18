import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { TokenUtils } from "@/lib/auth-service";

// Get user profile
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

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        preferences: user.preferences,
        addresses: user.addresses,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
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

// Update user profile
export async function PUT(req: NextRequest) {
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
    const updates = await req.json();

    // Remove sensitive fields that shouldn't be updated through this route
    const allowedUpdates = {
      firstName: updates.firstName,
      lastName: updates.lastName,
      phone: updates.phone,
      dateOfBirth: updates.dateOfBirth,
      gender: updates.gender,
      avatar: updates.avatar,
      preferences: updates.preferences,
      addresses: updates.addresses,
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key as keyof typeof allowedUpdates] === undefined) {
        delete allowedUpdates[key as keyof typeof allowedUpdates];
      }
    });

    await connectDB();

    const user = await User.findByIdAndUpdate(decoded.id, allowedUpdates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        preferences: user.preferences,
        addresses: user.addresses,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
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
