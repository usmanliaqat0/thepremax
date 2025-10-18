/**
 * Unified token validation system for consistent authentication
 */

import { NextRequest } from "next/server";
import { TokenUtils } from "./auth-service";
import { AdminAuthService } from "./admin-auth-service";
import { AdminPermissions } from "./types";

export interface TokenValidationResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    type: "user" | "admin";
    isEmailVerified?: boolean;
    permissions?: AdminPermissions;
  };
  error?: string;
}

export class TokenValidator {
  /**
   * Validates a token with optional type checking
   * @param request - The NextRequest object
   * @param requiredType - Optional token type requirement ('user' | 'admin')
   * @returns Promise<TokenValidationResult>
   */
  static async validateToken(
    request: NextRequest,
    requiredType?: "user" | "admin"
  ): Promise<TokenValidationResult> {
    try {
      const token = this.extractToken(request);
      if (!token) {
        return {
          success: false,
          error: "No authentication token provided",
        };
      }

      // Determine token type and validate accordingly
      const tokenType = this.detectTokenType(token);

      if (requiredType && tokenType !== requiredType) {
        return {
          success: false,
          error: `Invalid token type. Expected ${requiredType}`,
        };
      }

      if (tokenType === "admin") {
        return this.validateAdminTokenString(token);
      } else {
        return this.validateUserTokenString(token);
      }
    } catch (error) {
      return this.handleTokenError(error);
    }
  }

  /**
   * Extracts token from request headers or cookies
   */
  private static extractToken(request: NextRequest): string | null {
    // Try Authorization header first
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // Try accessToken cookie
    const accessToken = request.cookies.get("accessToken")?.value;
    if (accessToken) {
      return accessToken;
    }

    return null;
  }

  /**
   * Detects token type by attempting to decode it
   */
  private static detectTokenType(token: string): "user" | "admin" {
    try {
      // Try to decode without verification to check type
      const tokenParts = token.split(".");
      if (tokenParts.length < 2 || !tokenParts[1]) return "user";
      const decoded = JSON.parse(
        Buffer.from(tokenParts[1], "base64").toString()
      );
      return decoded.type === "admin" ? "admin" : "user";
    } catch {
      // Default to user token if we can't determine
      return "user";
    }
  }

  /**
   * Validates user token by token string
   */
  static validateUserTokenString(token: string): TokenValidationResult {
    try {
      const decoded = TokenUtils.verifyAccessToken(token);

      if (decoded.type !== "access") {
        return {
          success: false,
          error: "Invalid token type",
        };
      }

      return {
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          type: "user",
          ...(decoded.isEmailVerified !== undefined && {
            isEmailVerified: decoded.isEmailVerified,
          }),
        },
      };
    } catch (error) {
      return this.handleTokenError(error);
    }
  }

  /**
   * Validates admin token by token string
   */
  static validateAdminTokenString(token: string): TokenValidationResult {
    try {
      const decoded = AdminAuthService.verifyAccessToken(token);

      if (decoded.type !== "admin") {
        return {
          success: false,
          error: "Invalid admin token type",
        };
      }

      return {
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          type: "admin",
          ...(decoded.permissions && { permissions: decoded.permissions }),
        },
      };
    } catch (error) {
      return this.handleTokenError(error);
    }
  }

  /**
   * Handles token validation errors consistently
   */
  private static handleTokenError(error: unknown): TokenValidationResult {
    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        return {
          success: false,
          error: "Token has expired. Please log in again.",
        };
      } else if (error.message.includes("invalid")) {
        return {
          success: false,
          error: "Invalid token. Please log in again.",
        };
      } else if (error.message.includes("Invalid token type")) {
        return {
          success: false,
          error: "Invalid token type",
        };
      }
    }

    return {
      success: false,
      error: "Token validation failed. Please log in again.",
    };
  }

  /**
   * Convenience method for user token validation
   */
  static async validateUserToken(
    request: NextRequest
  ): Promise<TokenValidationResult> {
    return this.validateToken(request, "user");
  }

  /**
   * Convenience method for admin token validation
   */
  static async validateAdminToken(
    request: NextRequest
  ): Promise<TokenValidationResult> {
    return this.validateToken(request, "admin");
  }
}
