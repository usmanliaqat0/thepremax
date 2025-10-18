import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "@/lib/admin-auth-service";
import { PasswordUtils } from "@/lib/auth-service";
import connectDB from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminId, newPassword } = body;

    if (!adminId || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin ID and new password are required",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = PasswordUtils.validate(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordValidation.message,
        },
        { status: 400 }
      );
    }

    // Get the current user from the token
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

    // Only super admin can reset passwords
    if (
      currentUser.role !== "super_admin" ||
      currentUser.email !== process.env.SUPER_ADMIN_EMAIL
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only super admin can reset admin passwords",
        },
        { status: 403 }
      );
    }

    await connectDB();

    // Import Admin model only on server side
    const { default: Admin } = await import("@/lib/models/Admin");

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const targetAdmin = await Admin.findById(adminId).select("email");
    if (targetAdmin?.email === superAdminEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Super admin password cannot be reset through this endpoint",
        },
        { status: 400 }
      );
    }

    // Find the admin to reset
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await PasswordUtils.hash(newPassword);

    // Update the admin's password
    admin.password = hashedPassword;
    admin.updatedAt = new Date();
    await admin.save();

    return NextResponse.json(
      {
        success: true,
        message: "Admin password reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin password reset error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while resetting the password",
      },
      { status: 500 }
    );
  }
}
