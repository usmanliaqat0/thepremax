import { NextResponse } from "next/server";

export interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  path: string;
}

export class CookieUtils {
  private static readonly DEFAULT_CONFIG: CookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  };

  private static readonly REFRESH_TOKEN_CONFIG: CookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    path: "/",
  };

  /**
   * Sets access token cookie with consistent security settings
   */
  static setAccessTokenCookie(response: NextResponse, token: string): void {
    response.cookies.set("accessToken", token, this.DEFAULT_CONFIG);
  }

  /**
   * Sets refresh token cookie with consistent security settings
   */
  static setRefreshTokenCookie(response: NextResponse, token: string): void {
    response.cookies.set("refreshToken", token, this.REFRESH_TOKEN_CONFIG);
  }

  /**
   * Sets both access and refresh token cookies with consistent security settings
   */
  static setAuthCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken?: string | null
  ): void {
    this.setAccessTokenCookie(response, accessToken);

    if (refreshToken) {
      this.setRefreshTokenCookie(response, refreshToken);
    }
  }

  /**
   * Clears authentication cookies
   */
  static clearAuthCookies(response: NextResponse): void {
    response.cookies.set("accessToken", "", {
      ...this.DEFAULT_CONFIG,
      maxAge: 0,
    });

    response.cookies.set("refreshToken", "", {
      ...this.REFRESH_TOKEN_CONFIG,
      maxAge: 0,
    });
  }

  /**
   * Gets cookie configuration for custom cookies
   */
  static getCookieConfig(overrides: Partial<CookieConfig> = {}): CookieConfig {
    return {
      ...this.DEFAULT_CONFIG,
      ...overrides,
    };
  }
}
