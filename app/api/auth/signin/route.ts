import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { SigninData, AuthResponse } from "@/lib/types";
import { CookieUtils } from "@/lib/cookie-utils";
import { handleApiError } from "@/lib/error-handler";

export async function POST(req: NextRequest) {
  try {
    const body: SigninData = await req.json();
    const result = await AuthService.signin(body);

    if (result.success) {
      const response = NextResponse.json<AuthResponse>(
        {
          success: true,
          message: result.message!,
          user: result.user!,
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
      const statusCode = result.message?.includes("Invalid email or password")
        ? 401
        : result.message?.includes("not active")
        ? 403
        : 400;

      return NextResponse.json<AuthResponse>(
        { success: false, message: result.message! },
        { status: statusCode }
      );
    }
  } catch (error) {
    return handleApiError(error, "Internal server error");
  }
}
