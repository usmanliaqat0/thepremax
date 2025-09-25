import { NextRequest, NextResponse } from "next/server";
import { PasswordResetService } from "@/lib/password-reset-service";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    // Validate input
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, message: "Reset token is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "New password is required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // Reset password
    const resetResult = await PasswordResetService.resetPassword(
      token,
      password
    );

    if (resetResult.success) {
      return NextResponse.json({
        success: true,
        message:
          "Password reset successfully. You can now log in with your new password.",
      });
    } else {
      return NextResponse.json(
        { success: false, message: resetResult.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Verify reset token endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Reset token is required" },
        { status: 400 }
      );
    }

    const verificationResult = await PasswordResetService.verifyResetToken(
      token
    );

    if (verificationResult.success) {
      return NextResponse.json({
        success: true,
        message: "Reset token is valid",
        email: verificationResult.email,
      });
    } else {
      return NextResponse.json(
        { success: false, message: verificationResult.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
