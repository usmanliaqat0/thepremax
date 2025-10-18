import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import connectDB from "@/lib/db";
import Admin from "@/lib/models/Admin";
import { AdminMiddleware } from "@/lib/admin-middleware";
import { PasswordUtils } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await AdminMiddleware.verifyAdminToken(request);
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    const total = await Admin.countDocuments(filter);

    const admins = await Admin.find(filter)
      .select("-password")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: admins,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to process request");
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    // Only super admin can create admins
    if (authResult.user?.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Only super admin can create admins" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      permissions,
      status = "active",
    } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(password);

    // Create admin
    const admin = await Admin.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName,
      lastName,
      role: "admin", // All new admins are regular admins
      permissions: permissions || {},
      status,
      createdBy:
        authResult.user.email === process.env.SUPER_ADMIN_EMAIL
          ? undefined
          : authResult.user.id,
    });

    const adminData = await Admin.findById(admin._id)
      .select("-password")
      .populate("createdBy", "firstName lastName email")
      .lean();

    return NextResponse.json({
      success: true,
      data: adminData,
      message: "Admin created successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to process request");
  }
}
