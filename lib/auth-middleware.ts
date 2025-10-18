import { NextRequest } from "next/server";
import { TokenUtils } from "@/lib/auth-service";
import { TokenValidator } from "@/lib/token-validator";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    isEmailVerified?: boolean;
  };
}

function extractTokenFromHeader(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

function extractTokenFromCookies(req: NextRequest): string | null {
  return req.cookies.get("accessToken")?.value || null;
}

export async function authMiddleware(req: NextRequest): Promise<{
  id: string;
  email: string;
  role: string;
  isEmailVerified?: boolean;
} | null> {
  try {
    let token = extractTokenFromHeader(req);

    if (!token) {
      token = extractTokenFromCookies(req);
    }

    if (!token) {
      return null;
    }

    const decoded = TokenUtils.verifyAccessToken(token);

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return null;
  }
}

export class AuthMiddleware {
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
    const result = await TokenValidator.validateUserToken(req);

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Authentication failed",
      };
    }

    return {
      success: true,
      user: {
        id: result.user!.id,
        email: result.user!.email,
        role: result.user!.role,
        ...(result.user!.isEmailVerified !== undefined && {
          isEmailVerified: result.user!.isEmailVerified,
        }),
      },
    };
  }

  static hasRole(
    user: { role: string },
    requiredRole: string | string[]
  ): boolean {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
  }

  static isAdmin(user: { role: string }): boolean {
    return user.role === "admin";
  }

  static canAccessResource(
    user: { id: string; role: string },
    resourceUserId: string
  ): boolean {
    return user.id === resourceUserId || this.isAdmin(user);
  }
}
