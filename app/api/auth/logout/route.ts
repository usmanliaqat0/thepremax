import { NextResponse } from "next/server";
import { AuthResponse } from "@/lib/types";
import { CookieUtils } from "@/lib/cookie-utils";

export async function POST() {
  try {
    const response = NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    CookieUtils.clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error("Logout route error:", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
