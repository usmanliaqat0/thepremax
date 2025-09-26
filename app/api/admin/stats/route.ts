import { NextResponse } from "next/server";
import { AdminMiddleware } from "@/lib/admin-middleware";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export const GET = AdminMiddleware.requireAdmin(
  async () => {
    try {
      await connectDB();

      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedEmails,
        verifiedPhones,
        recentUsers,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: "active" }),
        User.countDocuments({ status: "inactive" }),
        User.countDocuments({ isEmailVerified: true }),
        User.countDocuments({ isPhoneVerified: true }),
        User.find()
          .select("firstName lastName email createdAt status")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

const userGrowth = "+12%";
      const emailVerificationRate = totalUsers > 0 ? Math.round((verifiedEmails / totalUsers) * 100) : 0;
      const phoneVerificationRate = totalUsers > 0 ? Math.round((verifiedPhones / totalUsers) * 100) : 0;

      const stats = {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          growth: userGrowth,
        },
        verification: {
          emailVerified: verifiedEmails,
          phoneVerified: verifiedPhones,
          emailVerificationRate,
          phoneVerificationRate,
        },
        recentUsers: recentUsers.map((user) => ({
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          status: user.status,
          createdAt: user.createdAt,
        })),
      };

      return NextResponse.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return AdminMiddleware.createServerErrorResponse("Failed to fetch statistics");
    }
  }
);