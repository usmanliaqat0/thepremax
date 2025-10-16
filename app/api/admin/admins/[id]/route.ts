import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Admin from "@/lib/models/Admin";
import { AdminMiddleware } from "@/lib/admin-middleware";
import { PasswordUtils } from "@/lib/auth-service";
import { handleApiError } from "@/lib/error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    // Check if user has permission to view admins
    if (authResult.user?.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions to view admins" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const admin = await Admin.findById(id)
      .select("-password")
      .populate("createdBy", "firstName lastName email")
      .lean();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch admin");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    // Only super admin can update admins
    if (authResult.user?.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Only super admin can update admins" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { email, password, firstName, lastName, permissions, status } = body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    if (admin.email === process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: "Cannot update super admin" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (email && email !== admin.email) {
      // Check if email is already taken by another admin
      const existingAdmin = await Admin.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (existingAdmin) {
        return NextResponse.json(
          { success: false, message: "Email already taken by another admin" },
          { status: 400 }
        );
      }
      updateData.email = email.toLowerCase().trim();
    }

    if (password) {
      updateData.password = await PasswordUtils.hash(password);
    }

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (permissions) updateData.permissions = permissions;
    if (status) updateData.status = status;

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .select("-password")
      .populate("createdBy", "firstName lastName email")
      .lean();

    return NextResponse.json({
      success: true,
      data: updatedAdmin,
      message: "Admin updated successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to update admin");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    // Only super admin can delete admins
    if (authResult.user?.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Only super admin can delete admins" },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;
    const admin = await Admin.findById(id);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    if (admin.email === process.env.SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: "Cannot delete super admin" },
        { status: 400 }
      );
    }

    // Prevent deleting self
    if (admin._id.toString() === authResult.user.id) {
      return NextResponse.json(
        { success: false, message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    await Admin.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to delete admin");
  }
}
