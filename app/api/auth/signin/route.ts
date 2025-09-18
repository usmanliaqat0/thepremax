import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth-service";
import { SigninData, AuthResponse } from "@/lib/types";

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

      response.cookies.set("accessToken", result.accessToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      if (result.refreshToken) {
        response.cookies.set("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
      }

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
    console.error("Signin route error:", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
