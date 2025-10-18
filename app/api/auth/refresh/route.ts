import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { AuthResponse } from "@/lib/types";
import { CookieUtils } from "@/lib/cookie-utils";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.JWT_REFRESH_SECRET) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Token refresh not available" },
        { status: 400 }
      );
    }

    let refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      const body = await req.json();
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Refresh token is required" },
        { status: 400 }
      );
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (result.success) {
      const response = NextResponse.json<AuthResponse>(
        {
          success: true,
          message: result.message!,
          token: result.accessToken!,
        },
        { status: 200 }
      );

      CookieUtils.setAuthCookies(
        response,
        result.accessToken!,
        result.refreshToken
      );

      return response;
    } else {
      const response = NextResponse.json<AuthResponse>(
        { success: false, message: result.message! },
        { status: 401 }
      );

      CookieUtils.clearAuthCookies(response);

      return response;
    }
  } catch (error) {
    console.error("Token refresh route error:", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
