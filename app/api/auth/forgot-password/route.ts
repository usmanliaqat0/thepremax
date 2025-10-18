import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/email-service";
import { VerificationUtils } from "@/lib/auth-service";
import { logError } from "@/lib/logger";
import { handleApiError } from "@/lib/error-handler";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "firstName email status"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this email address" },
        { status: 404 }
      );
    }

    if (user.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Account is not active. Please contact support.",
        },
        { status: 400 }
      );
    }

    const passwordResetToken = VerificationUtils.generateVerificationToken();
    const passwordResetExpires = VerificationUtils.getVerificationExpiry();

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    const emailResult = await EmailService.sendPasswordResetVerificationEmail(
      email,
      user.firstName,
      passwordResetToken
    );

    if (!emailResult.success) {
      logError(
        "Failed to send password reset verification email",
        "Email",
        new Error(emailResult.message)
      );
      return NextResponse.json(
        { success: false, message: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset verification code sent to your email.",
    });
  } catch (error) {
    return handleApiError(error, "Failed to process password reset request");
  }
}
