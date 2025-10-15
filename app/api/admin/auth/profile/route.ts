import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "@/lib/admin-auth-service";
import connectDB from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization token required",
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let currentUser;
    try {
      const payload = AdminAuthService.verifyAccessToken(token);
      currentUser = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    // If super admin, return hardcoded data
    if (
      currentUser.role === "super_admin" &&
      currentUser.id === "super-admin"
    ) {
      return NextResponse.json({
        success: true,
        user: {
          id: "super-admin",
          email: currentUser.email,
          firstName: "Super",
          lastName: "Admin",
          role: "super_admin",
          avatar: "/profile-images/defaults/admin.svg",
          isEmailVerified: true,
          isPhoneVerified: false,
          status: "active",
          preferences: {
            currency: "USD",
            language: "en",
            theme: "light",
            favoriteCategories: [],
          },
          addresses: [],
          permissions: AdminAuthService.getSuperAdminPermissions(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // For regular admins, get from database
    await connectDB();
    const { default: Admin } = await import("@/lib/models/Admin");

    const admin = await Admin.findById(currentUser.id).select("-password");
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    const adminUserData = {
      id: admin._id.toString(),
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: "admin",
      avatar: admin.avatar || "/profile-images/defaults/admin.svg",
      isEmailVerified: true,
      isPhoneVerified: false,
      status: admin.status === "suspended" ? "archived" : admin.status,
      preferences: {
        currency: "USD",
        language: "en",
        theme: "light",
        favoriteCategories: [],
      },
      addresses: [],
      permissions: admin.permissions,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: adminUserData,
    });
  } catch (error) {
    console.error("Admin profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching admin profile",
      },
      { status: 500 }
    );
  }
}
