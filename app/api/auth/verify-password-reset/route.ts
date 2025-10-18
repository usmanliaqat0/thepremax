import { NextRequest, NextResponse } from "next/server";
import { PasswordResetService } from "@/lib/password-reset-service";
import { PasswordUtils } from "@/lib/auth-service";

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

    // Validate password strength using the same validation as registration
    const passwordValidation = PasswordUtils.validate(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordValidation.message!,
        },
        { status: 400 }
      );
    }

    // Use the secure password reset service
    const resetResult = await PasswordResetService.resetPassword(
      code,
      newPassword
    );

    if (!resetResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: resetResult.message,
        },
        { status: 400 }
      );
    }

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
