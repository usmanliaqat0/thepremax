import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "./db";
import User from "./models/User";
import PasswordReset, { IPasswordReset } from "./models/PasswordReset";

export class PasswordResetService {
  // Generate a secure random token
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  // Create a password reset record
  static async createPasswordReset(email: string): Promise<{
    success: boolean;
    token?: string;
    message?: string;
  }> {
    try {
      await connectDB();

      // Check if user exists
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return {
          success: false,
          message: "No account found with this email address",
        };
      }

      // Check if user is active
      if (user.status !== "active") {
        return {
          success: false,
          message: "Account is not active. Please contact support.",
        };
      }

      // Invalidate any existing reset tokens for this email
      await PasswordReset.updateMany(
        { email: email.toLowerCase(), used: false },
        { used: true }
      );

      // Generate new reset token
      const token = this.generateResetToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      // Create new password reset record
      const passwordReset =
        new (PasswordReset as mongoose.Model<IPasswordReset>)({
          email: email.toLowerCase(),
          token,
          expiresAt,
          used: false,
        });

      await passwordReset.save();

      return {
        success: true,
        token,
        message: "Password reset token generated successfully",
      };
    } catch (error) {
      console.error("Create password reset error:", error);
      return {
        success: false,
        message: "Failed to create password reset token",
      };
    }
  }

  // Verify reset token
  static async verifyResetToken(token: string): Promise<{
    success: boolean;
    email?: string;
    message?: string;
  }> {
    try {
      await connectDB();

      const passwordReset = await PasswordReset.findOne({
        token,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!passwordReset) {
        return {
          success: false,
          message: "Invalid or expired reset token",
        };
      }

      return {
        success: true,
        email: passwordReset.email,
        message: "Reset token is valid",
      };
    } catch (error) {
      console.error("Verify reset token error:", error);
      return {
        success: false,
        message: "Failed to verify reset token",
      };
    }
  }

  // Reset password with token
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await connectDB();

      // Verify token
      const tokenVerification = await this.verifyResetToken(token);
      if (!tokenVerification.success) {
        return {
          success: false,
          message: tokenVerification.message,
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      const user = await User.findOneAndUpdate(
        { email: tokenVerification.email },
        { password: hashedPassword },
        { new: true }
      );

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Mark token as used
      await PasswordReset.findOneAndUpdate({ token }, { used: true });

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: "Failed to reset password",
      };
    }
  }

  // Clean up expired tokens (can be called periodically)
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await connectDB();
      await PasswordReset.deleteMany({
        expiresAt: { $lt: new Date() },
      });
    } catch (error) {
      console.error("Cleanup expired tokens error:", error);
    }
  }
}
