import { NextRequest, NextResponse } from "next/server";
import { TokenValidator } from "./token-validator";
import { AdminPermissions } from "./types";

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin";
  permissions?: AdminPermissions;
}

export class AdminMiddleware {
  static async verifyAdminToken(request: NextRequest): Promise<{
    success: boolean;
    user?: AdminUser;
    error?: string;
  }> {
    const result = await TokenValidator.validateAdminToken(request);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    // For super admin, we need to get the name from environment or hardcode
    const isSuperAdmin = result.user!.id === "super-admin";
    const firstName = isSuperAdmin ? "Super" : "Admin";
    const lastName = isSuperAdmin ? "Admin" : "User";

    return {
      success: true,
      user: {
        id: result.user!.id,
        email: result.user!.email,
        firstName,
        lastName,
        role: result.user!.role as "super_admin" | "admin",
        permissions: result.user!.permissions as AdminPermissions | undefined,
      },
    };
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
      const verification = await AdminMiddleware.verifyAdminToken(request);

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
        const verification = await AdminMiddleware.verifyAdminToken(request);

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
      const verification = await AdminMiddleware.verifyAdminToken(request);

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
  const verification = await AdminMiddleware.verifyAdminToken(request);

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
