import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";
import connectDB from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Code parameter required" },
        { status: 400 }
      );
    }

    console.log("Testing verification code:", code);

const users = await User.find({
      emailVerificationToken: { $exists: true, $ne: null },
      isEmailVerified: false,
    }).select("email emailVerificationToken");

    console.log("Found users with verification tokens:", users.length);

    const matchingUsers = users.filter((user) => {
      if (user.emailVerificationToken) {
        const tokenStart = user.emailVerificationToken
          .substring(0, 6)
          .toUpperCase();
        console.log(
          `User ${
            user.email
          }: token starts with ${tokenStart}, looking for ${code.toUpperCase()}`
        );
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
        fullToken: u.emailVerificationToken?.substring(0, 10) + "...",
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
