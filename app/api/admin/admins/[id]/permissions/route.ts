import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "@/lib/admin-auth-service";
import connectDB from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Only super admin can update permissions
    if (
      currentUser.role !== "super_admin" ||
      currentUser.id !== "super-admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only super admin can update admin permissions",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { permissions } = body;

    if (!permissions) {
      return NextResponse.json(
        {
          success: false,
          message: "Permissions are required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Import Admin model only on server side
    const { default: Admin } = await import("@/lib/models/Admin");

    // Find the admin to update
    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    // Cannot update super admin permissions
    if (id === "super-admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot update super admin permissions",
        },
        { status: 400 }
      );
    }

    // Update permissions
    admin.permissions = permissions;
    admin.updatedAt = new Date();
    await admin.save();

    return NextResponse.json(
      {
        success: true,
        message: "Admin permissions updated successfully",
        admin: {
          id: admin._id.toString(),
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          role: admin.role,
          permissions: admin.permissions,
          updatedAt: admin.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update admin permissions error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while updating admin permissions",
      },
      { status: 500 }
    );
  }
}
