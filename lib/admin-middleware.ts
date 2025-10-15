import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "./admin-auth-service";
import { AdminPermissions } from "./types";

interface AdminJWTPayload {
  id: string;
  email: string;
  role: string;
  type: "admin";
  permissions?: AdminPermissions;
  iat?: number;
  exp?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin";
  permissions?: AdminPermissions;
}

export class AdminMiddleware {
  static verifyAdminToken(request: NextRequest): {
    success: boolean;
    user?: AdminUser;
    error?: string;
  } {
    try {
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

      const decoded = AdminAuthService.verifyAccessToken(
        token
      ) as AdminJWTPayload;

      if (decoded.type !== "admin") {
        return {
          success: false,
          error: "Insufficient permissions. Admin access required.",
        };
      }

      // For super admin, we need to get the name from environment or hardcode
      const isSuperAdmin = decoded.id === "super-admin";
      const firstName = isSuperAdmin ? "Super" : "Admin";
      const lastName = isSuperAdmin ? "Admin" : "User";

      return {
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          firstName,
          lastName,
          role: decoded.role as "super_admin" | "admin",
          permissions: decoded.permissions,
        },
      };
    } catch {
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
      ...args: unknown[]
    ) => Promise<NextResponse>
  ) {
    return async (
      request: NextRequest,
      ...args: unknown[]
    ): Promise<NextResponse> => {
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

      return handler(request, verification.user, ...args);
    };
  }

  static requirePermission(section: string, action: string) {
    return (
      handler: (
        request: NextRequest,
        adminUser: AdminUser,
        ...args: unknown[]
      ) => Promise<NextResponse>
    ) => {
      return async (
        request: NextRequest,
        ...args: unknown[]
      ): Promise<NextResponse> => {
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

        // Super admin has all permissions
        if (verification.user.id === "super-admin") {
          return handler(request, verification.user, ...args);
        }

        // Check specific permission - only super admin can access all routes
        if (verification.user.id !== "super-admin") {
          return NextResponse.json(
            {
              success: false,
              message: `Insufficient permissions. ${section}.${action} required.`,
            },
            { status: 403 }
          );
        }

        return handler(request, verification.user, ...args);
      };
    };
  }

  static requireSuperAdmin(
    handler: (
      request: NextRequest,
      adminUser: AdminUser,
      ...args: unknown[]
    ) => Promise<NextResponse>
  ) {
    return async (
      request: NextRequest,
      ...args: unknown[]
    ): Promise<NextResponse> => {
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

      if (verification.user.role !== "super_admin") {
        return NextResponse.json(
          {
            success: false,
            message: "Super admin access required",
          },
          { status: 403 }
        );
      }

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

export function isAdmin(userRole?: string): boolean {
  return ["super_admin", "admin"].includes(userRole || "");
}

export function isSuperAdmin(userRole?: string): boolean {
  return userRole === "super_admin";
}

export function useAdminAuth() {
  const checkAdminAccess = (userRole?: string) => {
    return isAdmin(userRole);
  };

  const checkSuperAdminAccess = (userRole?: string) => {
    return isSuperAdmin(userRole);
  };

  return { checkAdminAccess, checkSuperAdminAccess, isAdmin, isSuperAdmin };
}

// Export a function that can be used in API routes
export async function adminMiddleware(request: NextRequest): Promise<{
  success: boolean;
  user?: AdminUser;
  error?: string;
  status?: number;
}> {
  const verification = AdminMiddleware.verifyAdminToken(request);

  if (!verification.success) {
    return {
      success: false,
      error: verification.error || "Admin access required",
      status: 401,
    };
  }

  return {
    success: true,
    user: verification.user,
  };
}
