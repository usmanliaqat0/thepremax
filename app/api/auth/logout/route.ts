import { NextRequest, NextResponse } from "next/server";
import { AuthResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json<AuthResponse>(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout route error:", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
