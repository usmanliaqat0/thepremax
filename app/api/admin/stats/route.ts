import { NextResponse } from "next/server";
import { AdminMiddleware } from "@/lib/admin-middleware";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

export const GET = AdminMiddleware.requireAdmin(async () => {
  try {
    await connectDB();

    // Get current date and last month date
    const now = new Date();
    const lastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      verifiedEmails,
      verifiedPhones,
      recentUsers,
      // Get user counts for growth calculation
      totalUsersLastMonth,
      activeUsersLastMonth,
      verifiedEmailsLastMonth,
      verifiedPhonesLastMonth,
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
      // Growth calculation data
      User.countDocuments({ createdAt: { $lt: lastMonth } }),
      User.countDocuments({ status: "active", createdAt: { $lt: lastMonth } }),
      User.countDocuments({
        isEmailVerified: true,
        createdAt: { $lt: lastMonth },
      }),
      User.countDocuments({
        isPhoneVerified: true,
        createdAt: { $lt: lastMonth },
      }),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const growth = ((current - previous) / previous) * 100;
      return growth >= 0 ? `+${Math.round(growth)}%` : `${Math.round(growth)}%`;
    };

    const userGrowth = calculateGrowth(totalUsers, totalUsersLastMonth);
    const activeUserGrowth = calculateGrowth(activeUsers, activeUsersLastMonth);
    const emailVerificationGrowth = calculateGrowth(
      verifiedEmails,
      verifiedEmailsLastMonth
    );
    const phoneVerificationGrowth = calculateGrowth(
      verifiedPhones,
      verifiedPhonesLastMonth
    );

    const emailVerificationRate =
      totalUsers > 0 ? Math.round((verifiedEmails / totalUsers) * 100) : 0;
    const phoneVerificationRate =
      totalUsers > 0 ? Math.round((verifiedPhones / totalUsers) * 100) : 0;

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        growth: userGrowth,
        activeGrowth: activeUserGrowth,
      },
      verification: {
        emailVerified: verifiedEmails,
        phoneVerified: verifiedPhones,
        emailVerificationRate,
        phoneVerificationRate,
        emailGrowth: emailVerificationGrowth,
        phoneGrowth: phoneVerificationGrowth,
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
    return AdminMiddleware.createServerErrorResponse(
      "Failed to fetch statistics"
    );
  }
});
