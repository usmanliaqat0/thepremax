import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { SigninData } from "@/lib/types";
import { CookieUtils } from "@/lib/cookie-utils";
import { ApiResponseBuilder } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body: SigninData = await req.json();
    const result = await AuthService.signin(body);

    if (result.success) {
      // Create response in the format expected by AuthContext
      const response = NextResponse.json(
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

      return NextResponse.json(
        {
          success: false,
          message: result.message!,
        },
        { status: statusCode }
      );
    }
  } catch (error) {
    return ApiResponseBuilder.internalError(
      "Internal server error",
      error as Error
    );
  }
}
