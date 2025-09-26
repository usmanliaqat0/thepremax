import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { code, newPassword } = await req.json();

    if (!code || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code and new password are required",
        },
        { status: 400 }
      );
    }

if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    await connectDB();

let user;
    if (code.length === 6) {

      const upperCode = code.toUpperCase();
      console.log("Looking for user with password reset code:", upperCode);

const escapedCode = upperCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      user = await User.findOne({
        passwordResetToken: { $regex: `^${escapedCode}`, $options: "i" },
        passwordResetExpires: { $gt: new Date() },
      });

      console.log("Found user:", user ? "Yes" : "No");
      if (user) {
        console.log(
          "User token starts with:",
          user.passwordResetToken?.substring(0, 6)
        );
      }
    } else {

      user = await User.findOne({
        passwordResetToken: code,
        passwordResetExpires: { $gt: new Date() },
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

const hashedPassword = await bcrypt.hash(newPassword, 12);

user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Verify password reset error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

