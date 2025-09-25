import { NextRequest, NextResponse } from "next/server";
import { AuthMiddleware } from "./auth-middleware";
import User from "./models/User";
import connectDB from "./db";

export async function requireEmailVerification(
  req: NextRequest
): Promise<NextResponse | null> {
  try {
    // Check if user is authenticated
    const authResult = await AuthMiddleware.verifyRequest(req);

    if (!authResult.success || !authResult.user) {
      return null; // Not authenticated, let auth middleware handle it
    }

    // Connect to database
    await connectDB();

    // Get user from database to check verification status
    const user = await User.findById(authResult.user.id);

    if (!user) {
      return null; // User not found, let auth middleware handle it
    }

    // If email is not verified, redirect to verification page (skip for admin users)
    if (!user.isEmailVerified && user.role !== "admin") {
      const verificationUrl = `/verify-code?email=${encodeURIComponent(
        user.email
      )}`;
      return NextResponse.redirect(new URL(verificationUrl, req.url));
    }

    return null; // Email is verified, allow access
  } catch (error) {
    console.error("Email verification middleware error:", error);
    return null; // Let other middleware handle the error
  }
}
