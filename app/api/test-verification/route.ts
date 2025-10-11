import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";
import connectDB from "@/lib/db";
import { AdminMiddleware } from "@/lib/admin-middleware";

export async function GET(req: NextRequest) {
  try {
    const auth = AdminMiddleware.verifyAdminToken(req);
    if (!auth.success) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      );
    }
    await connectDB();

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Code parameter required" },
        { status: 400 }
      );
    }

    // Intentionally avoid logging sensitive codes in production

const users = await User.find({
      emailVerificationToken: { $exists: true, $ne: null },
      isEmailVerified: false,
    }).select("email emailVerificationToken");

    // Avoid verbose token logging

    const matchingUsers = users.filter((user) => {
      if (user.emailVerificationToken) {
        const tokenStart = user.emailVerificationToken
          .substring(0, 6)
          .toUpperCase();
        return tokenStart === code.toUpperCase();
      }
      return false;
    });

    return NextResponse.json({
      code: code.toUpperCase(),
      totalUsers: users.length,
      matchingUsers: matchingUsers.length,
      users: users.map((u) => ({
        email: u.email,
        tokenStart: u.emailVerificationToken?.substring(0, 6).toUpperCase(),
      })),
      matches: matchingUsers.map((u) => ({
        email: u.email,
        tokenStart: u.emailVerificationToken?.substring(0, 6).toUpperCase(),
      })),
    });
  } catch (error) {
    console.error("Test verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
