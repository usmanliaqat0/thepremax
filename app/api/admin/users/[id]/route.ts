import { NextRequest, NextResponse } from "next/server";
import { AdminMiddleware } from "@/lib/admin-middleware";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

// GET - Fetch specific user (Admin only)
export const GET = AdminMiddleware.requireAdmin(
  async (request: NextRequest, adminUser: any, { params }: { params: { id: string } }) => {
    try {
      await connectDB();

      const user = await User.findById(params.id).select("-password").lean();

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          ...user,
          id: user._id.toString(),
          _id: undefined,
        },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return AdminMiddleware.createServerErrorResponse("Failed to fetch user");
    }
  }
);

// PUT - Update user (Admin only)
export const PUT = AdminMiddleware.requireAdmin(
  async (request: NextRequest, adminUser: any, { params }: { params: { id: string } }) => {
    try {
      const body = await request.json();
      const {
        firstName,
        lastName,
        email,
        phone,
        gender,
        status,
        role,
        isEmailVerified,
        isPhoneVerified,
      } = body;

      await connectDB();

      const user = await User.findById(params.id);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 }
        );
      }

      // Check if email is being changed and if it conflicts with another user
      if (email && email !== user.email) {
        const existingUser = await User.findOne({
          email: email.toLowerCase(),
          _id: { $ne: params.id }
        });
        if (existingUser) {
          return NextResponse.json(
            {
              success: false,
              message: "Email is already in use by another user",
            },
            { status: 409 }
          );
        }
      }

      // Update user fields
      const updateData: any = {};

      if (firstName !== undefined) updateData.firstName = firstName.trim();
      if (lastName !== undefined) updateData.lastName = lastName.trim();
      if (email !== undefined) updateData.email = email.toLowerCase();
      if (phone !== undefined) updateData.phone = phone?.trim();
      if (gender !== undefined) updateData.gender = gender;
      if (status !== undefined) updateData.status = status;
      if (role !== undefined) updateData.role = role;
      if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified;
      if (isPhoneVerified !== undefined) updateData.isPhoneVerified = isPhoneVerified;

      updateData.updatedAt = new Date();

      const updatedUser = await User.findByIdAndUpdate(
        params.id,
        updateData,
        { new: true, runValidators: true }
      ).select("-password").lean();

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        data: {
          ...updatedUser,
          id: updatedUser!._id.toString(),
          _id: undefined,
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return AdminMiddleware.createServerErrorResponse("Failed to update user");
    }
  }
);

// DELETE - Delete user (Admin only)
export const DELETE = AdminMiddleware.requireAdmin(
  async (request: NextRequest, adminUser: any, { params }: { params: { id: string } }) => {
    try {
      await connectDB();

      const user = await User.findById(params.id);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 }
        );
      }

      // Prevent admin from deleting themselves
      if (params.id === adminUser.id) {
        return NextResponse.json(
          {
            success: false,
            message: "You cannot delete your own account",
          },
          { status: 400 }
        );
      }

      await User.findByIdAndDelete(params.id);

      return NextResponse.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return AdminMiddleware.createServerErrorResponse("Failed to delete user");
    }
  }
);