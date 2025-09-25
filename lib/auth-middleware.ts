import { NextRequest } from "next/server";
import { TokenUtils } from "@/lib/auth-service";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    isEmailVerified?: boolean;
  };
}

export class AuthMiddleware {
  /**
   * Extract and verify JWT token from request
   */
  static async verifyRequest(req: NextRequest): Promise<{
    success: boolean;
    user?: {
      id: string;
      email: string;
      role: string;
      isEmailVerified?: boolean;
    };
    error?: string;
  }> {
    try {
      // Get token from Authorization header or cookies
      let token = this.extractTokenFromHeader(req);

      if (!token) {
        token = this.extractTokenFromCookies(req);
      }

      if (!token) {
        return {
          success: false,
          error: "Authorization token required",
        };
      }

      // Verify token
      const decoded = TokenUtils.verifyAccessToken(token);

      return {
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        },
      };
    } catch (error) {
      console.error("Auth middleware error:", error);

      if (
        error instanceof Error &&
        error.message.includes("Invalid or expired")
      ) {
        return {
          success: false,
          error: "Invalid or expired token",
        };
      }

      return {
        success: false,
        error: "Authentication failed",
      };
    }
  }

  /**
   * Extract token from Authorization header
   */
  private static extractTokenFromHeader(req: NextRequest): string | null {
    const authHeader = req.headers.get("authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return null;
  }

  /**
   * Extract token from cookies
   */
  private static extractTokenFromCookies(req: NextRequest): string | null {
    return req.cookies.get("accessToken")?.value || null;
  }

  /**
   * Check if user has required role
   */
  static hasRole(
    user: { role: string },
    requiredRole: string | string[]
  ): boolean {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: { role: string }): boolean {
    return user.role === "admin";
  }

  /**
   * Check if user owns the resource or is admin
   */
  static canAccessResource(
    user: { id: string; role: string },
    resourceUserId: string
  ): boolean {
    return user.id === resourceUserId || this.isAdmin(user);
  }
}
