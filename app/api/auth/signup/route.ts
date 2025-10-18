import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { SignupData, AuthResponse } from "@/lib/types";
import { CookieUtils } from "@/lib/cookie-utils";
import { handleApiError } from "@/lib/error-handler";

export async function POST(req: NextRequest) {
  try {
    const body: SignupData = await req.json();
    const result = await AuthService.signup(body);

    if (result.success) {
      const response = NextResponse.json<AuthResponse>(
        {
          success: true,
          message: result.message!,
          user: result.user!,
          token: result.accessToken!,
          requiresVerification: true,
        },
        { status: 201 }
      );

      CookieUtils.setAuthCookies(
        response,
        result.accessToken!,
        result.refreshToken
      );

      return response;
    } else {
      const statusCode = result.message?.includes("already exists") ? 409 : 400;

      return NextResponse.json<AuthResponse>(
        { success: false, message: result.message! },
        { status: statusCode }
      );
    }
  } catch (error) {
    return handleApiError(error, "Internal server error");
  }
}
