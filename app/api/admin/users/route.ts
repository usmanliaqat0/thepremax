import { NextRequest, NextResponse } from "next/server";
import { AdminMiddleware } from "@/lib/admin-middleware";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

// GET - Fetch all users (Admin only)
export const GET = AdminMiddleware.requireAdmin(
  async (request: NextRequest) => {
    try {
      await connectDB();

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const search = searchParams.get("search") || "";
      const status = searchParams.get("status") || "";
      const role = searchParams.get("role") || "";

      // Build filter query
      const filter: Record<string, unknown> = {};

      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      if (status && status !== "all") {
        filter.status = status;
      }

      if (role && role !== "all") {
        filter.role = role;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Fetch users with pagination
      const [users, totalUsers] = await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalUsers / limit);

      return NextResponse.json({
        success: true,
        data: {
          users: users.map((user) => ({
            ...user,
            id: user._id.toString(),
            _id: undefined,
          })),
          pagination: {
            page,
            limit,
            total: totalUsers,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return AdminMiddleware.createServerErrorResponse("Failed to fetch users");
    }
  }
);

// POST - Create new user (Admin only)
export const POST = AdminMiddleware.requireAdmin(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const {
        email,
        firstName,
        lastName,
        phone,
        gender,
        role = "customer",
        status = "active",
      } = body;

      // Validate required fields
      if (!email || !firstName || !lastName) {
        return NextResponse.json(
          {
            success: false,
            message: "Email, first name, and last name are required",
          },
          { status: 400 }
        );
      }

      await connectDB();

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "User with this email already exists",
          },
          { status: 409 }
        );
      }

      // Create new user
      const newUser = await User.create({
        email: email.toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim(),
        gender,
        role,
        status,
        preferences: {
          currency: "USD",
          language: "en",
          theme: "light",
          favoriteCategories: [],
        },
      });

      const savedUser = await newUser.save();

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        data: {
          ...savedUser.toObject(),
          id: (savedUser as any)._id.toString(),
          _id: undefined,
          password: undefined,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return AdminMiddleware.createServerErrorResponse("Failed to create user");
    }
  }
);
