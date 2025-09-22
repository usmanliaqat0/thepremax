import { NextRequest, NextResponse } from "next/server";
import { TokenUtils } from "./auth-service";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin";
}

export class AdminMiddleware {
  static verifyAdminToken(request: NextRequest): {
    success: boolean;
    user?: AdminUser;
    error?: string;
  } {
    try {
      // Get token from Authorization header or cookies
      let token = request.headers.get("authorization")?.replace("Bearer ", "");

      if (!token) {
        token = request.cookies.get("accessToken")?.value;
      }

      if (!token) {
        return {
          success: false,
          error: "No authentication token provided",
        };
      }

      // Verify token
      const decoded = TokenUtils.verifyAccessToken(token);

      // Check if user is admin
      if (decoded.role !== "admin") {
        return {
          success: false,
          error: "Insufficient permissions. Admin access required.",
        };
      }

      // Return admin user data
      return {
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          firstName: "Super",
          lastName: "Admin",
          role: "admin",
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Invalid or expired token",
      };
    }
  }

  static requireAdmin(
    handler: (
      request: NextRequest,
      adminUser: AdminUser,
      ...args: any[]
    ) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
      const verification = AdminMiddleware.verifyAdminToken(request);

      if (!verification.success || !verification.user) {
        return NextResponse.json(
          {
            success: false,
            message: verification.error || "Admin access required",
          },
          { status: 401 }
        );
      }

      // Call the handler with admin user
      return handler(request, verification.user, ...args);
    };
  }

  static createUnauthorizedResponse(message = "Admin access required") {
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 401 }
    );
  }

  static createForbiddenResponse(message = "Insufficient permissions") {
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 403 }
    );
  }

  static createServerErrorResponse(message = "Internal server error") {
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

// Helper function to check if user is admin on client side
export function isAdmin(userRole?: string): boolean {
  return userRole === "admin";
}

// Hook for admin authentication in React components
export function useAdminAuth() {
  const checkAdminAccess = (userRole?: string) => {
    return isAdmin(userRole);
  };

  return { checkAdminAccess, isAdmin };
}