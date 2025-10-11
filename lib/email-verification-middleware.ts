import { NextRequest, NextResponse } from "next/server";
import { AuthMiddleware } from "./auth-middleware";
import User from "./models/User";
import connectDB from "./db";

export async function requireEmailVerification(
  req: NextRequest
): Promise<NextResponse | null> {
  try {

    const authResult = await AuthMiddleware.verifyRequest(req);

    if (!authResult.success || !authResult.user) {
      return null;
    }

await connectDB();

const user = await User.findById(authResult.user.id);

    if (!user) {
      return null;
    }

if (!user.isEmailVerified && user.role !== "admin") {
      const verificationUrl = `/verify-code?email=${encodeURIComponent(
        user.email
      )}`;
      return NextResponse.redirect(new URL(verificationUrl, req.url));
    }

    return null;
  } catch (error) {
    console.error("Email verification middleware error:", error);
    return null;
  }
}
