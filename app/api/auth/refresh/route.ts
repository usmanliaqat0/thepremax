import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { AuthResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    // Check if refresh tokens are enabled
    if (!process.env.JWT_REFRESH_SECRET) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Token refresh not available" },
        { status: 400 }
      );
    }

    // Get refresh token from cookies or body
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

      // Update cookies with new tokens
      response.cookies.set("accessToken", result.accessToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      // Only set refresh token cookie if refresh token is available
      if (result.refreshToken) {
        response.cookies.set("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: "/",
        });
      }

      return response;
    } else {
      // Clear invalid tokens
      const response = NextResponse.json<AuthResponse>(
        { success: false, message: result.message! },
        { status: 401 }
      );

      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");

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
