import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "@/lib/admin-auth-service";
import { CookieUtils } from "@/lib/cookie-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const result = await AdminAuthService.signin(email, password);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      { status: 200 }
    );

    // Set HTTP-only cookies for security
    CookieUtils.setAuthCookies(
      response,
      result.accessToken!,
      result.refreshToken
    );

    return response;
  } catch (error) {
    console.error("Admin signin error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during admin signin",
      },
      { status: 500 }
    );
  }
}
