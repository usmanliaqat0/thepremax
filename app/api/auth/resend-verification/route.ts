import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const result = await AuthService.resendVerificationEmail(email);

    if (result.success) {
      return NextResponse.json(
        { success: true, message: result.message },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Resend verification email route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
