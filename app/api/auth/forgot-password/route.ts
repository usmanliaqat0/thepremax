import { NextRequest, NextResponse } from "next/server";
import { PasswordResetService } from "@/lib/password-reset-service";
import { EmailService } from "@/lib/email-service";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user details for email personalization
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "firstName email status"
    );

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists and is active
    if (user && user.status === "active") {
      // Create password reset token
      const resetResult = await PasswordResetService.createPasswordReset(email);

      if (resetResult.success && resetResult.token) {
        // Send password reset email
        const emailResult = await EmailService.sendPasswordResetEmail(
          email,
          user.firstName,
          resetResult.token
        );

        if (!emailResult.success) {
          console.error(
            "Failed to send password reset email:",
            emailResult.message
          );
        }
      }
    }

    // Always return success message to prevent email enumeration
    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
