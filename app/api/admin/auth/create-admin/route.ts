import { NextRequest, NextResponse } from "next/server";
import { AdminAuthService } from "@/lib/admin-auth-service";
import { PasswordUtils } from "@/lib/auth-service";
import connectDB from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, first name, and last name are required",
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = PasswordUtils.validate(password);
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

    // Only super admin can create new admins
    if (
      currentUser.role !== "super_admin" ||
      currentUser.id !== "super-admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Only super admin can create new admin accounts",
        },
        { status: 403 }
      );
    }

    await connectDB();

    // Import Admin model only on server side
    const { default: Admin } = await import("@/lib/models/Admin");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "An admin with this email already exists",
        },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await PasswordUtils.hash(password);

    // Create new admin
    const newAdmin = await Admin.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: "admin",
      status: "active",
      createdBy: currentUser.id === "super-admin" ? null : currentUser.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin account created successfully",
        admin: {
          id: newAdmin._id.toString(),
          email: newAdmin.email,
          firstName: newAdmin.firstName,
          lastName: newAdmin.lastName,
          role: newAdmin.role,
          status: newAdmin.status,
          createdAt: newAdmin.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the admin account",
      },
      { status: 500 }
    );
  }
}
