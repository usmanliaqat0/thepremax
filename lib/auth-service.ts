import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import { AuthUser, SigninData, SignupData } from "./types";
import User, { IUser } from "./models/User";
import connectDB from "./db";
import { EmailService } from "./email-service";

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  type: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key-here";
const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  JWT_SECRET environment variable not found. Using default secret (not recommended for production)."
  );
}

const REFRESH_TOKENS_ENABLED = !!JWT_REFRESH_SECRET;

export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;
  private static readonly MIN_LENGTH = 8;

  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async compare(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static validate(password: string): { valid: boolean; message?: string } {
    if (password.length < this.MIN_LENGTH) {
      return {
        valid: false,
        message: `Password must be at least ${this.MIN_LENGTH} characters long`,
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      return {
        valid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }

    if (!hasLowerCase) {
      return {
        valid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }

    if (!hasNumbers) {
      return {
        valid: false,
        message: "Password must contain at least one number",
      };
    }

    if (!hasSpecialChar) {
      return {
        valid: false,
        message: "Password must contain at least one special character",
      };
    }

    return { valid: true };
  }
}

export class EmailUtils {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  static isValid(email: string): boolean {
    return this.EMAIL_REGEX.test(email.trim().toLowerCase());
  }

  static normalize(email: string): string {
    return email.trim().toLowerCase();
  }
}

export class TokenUtils {
  static generateAccessToken(user: AuthUser): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    } as jwt.SignOptions);
  }

  static generateRefreshToken(user: AuthUser): string | null {
    if (!REFRESH_TOKENS_ENABLED || !JWT_REFRESH_SECRET) {
      return null;
    }

    const payload = {
      id: user.id,
      email: user.email,
      type: "refresh",
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    } as jwt.SignOptions);
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      if (decoded.type !== "access") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch {
      throw new Error("Invalid or expired access token");
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    if (!REFRESH_TOKENS_ENABLED || !JWT_REFRESH_SECRET) {
      throw new Error("Refresh tokens are not enabled");
    }

    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
      if (decoded.type !== "refresh") {
        throw new Error("Invalid token type");
      }
      return decoded;
    } catch {
      throw new Error("Invalid or expired refresh token");
    }
  }
}

export class AvatarUtils {
  static getDefaultAvatar(gender?: "male" | "female" | "other"): string {
    const basePath = "/profile-images/defaults";
    switch (gender) {
      case "male":
        return `${basePath}/male-avatar.svg`;
      case "female":
        return `${basePath}/female-avatar.svg`;
      case "other":
        return `${basePath}/other-avatar.svg`;
      default:
        return `${basePath}/male-avatar.svg`;
    }
  }

  static generateAvatarPath(userId: string, filename: string): string {
    return `/uploads/avatars/user-${userId}-${Date.now()}-${filename}`;
  }
}

export class VerificationUtils {
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static getVerificationExpiry(): Date {
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }
}

export class AuthService {
  static async signin(data: SigninData): Promise<{
    success: boolean;
    user?: AuthUser;
    accessToken?: string;
    refreshToken?: string | null;
    message?: string;
  }> {
    try {
      const { email, password } = data;

      if (!email || !password) {
        return {
          success: false,
          message: "Email and password are required",
        };
      }

      if (!EmailUtils.isValid(email)) {
        return {
          success: false,
          message: "Please provide a valid email address",
        };
      }

      const normalizedEmail = EmailUtils.normalize(email);

      // Check if this is an admin email trying to login through normal login
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
      if (
        superAdminEmail &&
        normalizedEmail === EmailUtils.normalize(superAdminEmail)
      ) {
        return {
          success: false,
          message: "Admin accounts must use the admin login portal",
        };
      }

      await connectDB();

      // Check if this email belongs to an admin user
      const { default: Admin } = await import("./models/Admin");
      const adminUser = await Admin.findOne({
        email: normalizedEmail,
        status: "active",
      });

      if (adminUser) {
        return {
          success: false,
          message: "Admin accounts must use the admin login portal",
        };
      }

      const user = await User.findOne({ email: normalizedEmail }).select(
        "+password"
      );

      if (!user) {
        return {
          success: false,
          message: "No account found with this email address",
        };
      }

      if (user.status !== "active") {
        return {
          success: false,
          message: "Account is not active. Please contact support.",
        };
      }

      const isPasswordValid = await PasswordUtils.compare(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Incorrect password. Please try again.",
        };
      }

      const userData: AuthUser = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status,
        preferences: user.preferences,
        addresses: user.addresses,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };

      const accessToken = TokenUtils.generateAccessToken(userData);
      const refreshToken = TokenUtils.generateRefreshToken(userData);

      return {
        success: true,
        user: userData,
        accessToken,
        refreshToken,
        message: "Login successful",
      };
    } catch (error) {
      console.error("Signin error:", error);
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }

  static async signup(data: SignupData): Promise<{
    success: boolean;
    user?: AuthUser;
    accessToken?: string;
    refreshToken?: string | null;
    message?: string;
  }> {
    try {
      const { email, password, firstName, lastName, gender, phone } = data;

      if (!email || !password || !firstName || !lastName) {
        return {
          success: false,
          message: "Email, password, first name, and last name are required",
        };
      }

      if (!EmailUtils.isValid(email)) {
        return {
          success: false,
          message: "Please provide a valid email address",
        };
      }

      const passwordValidation = PasswordUtils.validate(password);
      if (!passwordValidation.valid) {
        return {
          success: false,
          message: passwordValidation.message!,
        };
      }

      await connectDB();

      const normalizedEmail = EmailUtils.normalize(email);
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser) {
        return {
          success: false,
          message: "User with this email already exists",
        };
      }

      const hashedPassword = await PasswordUtils.hash(password);

      const emailVerificationToken =
        VerificationUtils.generateVerificationToken();
      const emailVerificationExpires =
        VerificationUtils.getVerificationExpiry();

      const newUser = new (User as mongoose.Model<IUser>)({
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim(),
        gender,
        avatar: AvatarUtils.getDefaultAvatar(gender),
        isEmailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
        preferences: {
          currency: "USD",
          language: "en",
          theme: "light",
          favoriteCategories: [],
        },
      });

      const savedUser = await newUser.save();

      const userData: AuthUser = {
        id: savedUser._id.toString(),
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        gender: savedUser.gender,
        avatar: savedUser.avatar,
        role: savedUser.role,
        isEmailVerified: savedUser.isEmailVerified,
        isPhoneVerified: savedUser.isPhoneVerified,
        status: savedUser.status,
        preferences: savedUser.preferences,
        addresses: savedUser.addresses,
        createdAt: savedUser.createdAt.toISOString(),
        updatedAt: savedUser.updatedAt.toISOString(),
      };

      const accessToken = TokenUtils.generateAccessToken(userData);
      const refreshToken = TokenUtils.generateRefreshToken(userData);

      EmailService.sendEmailVerificationEmail(
        email,
        firstName,
        emailVerificationToken
      ).catch((error) => {
        console.error("Failed to send email verification email:", error);
      });

      return {
        success: true,
        user: userData,
        accessToken,
        refreshToken,
        message:
          "Account created successfully. Please check your email to verify your account.",
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: "Internal server error",
      };
    }
  }

  static async refreshToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string | null;
    message?: string;
  }> {
    try {
      const decoded = TokenUtils.verifyRefreshToken(refreshToken);

      await connectDB();

      const user = await User.findById(decoded.id);
      if (!user || user.status !== "active") {
        return {
          success: false,
          message: "User not found or inactive",
        };
      }

      const userData: AuthUser = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status,
        preferences: user.preferences,
        addresses: user.addresses,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };

      const newAccessToken = TokenUtils.generateAccessToken(userData);
      const newRefreshToken = TokenUtils.generateRefreshToken(userData);

      return {
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        message: "Token refreshed successfully",
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      return {
        success: false,
        message: "Invalid or expired refresh token",
      };
    }
  }

  static async getUserById(id: string): Promise<{
    success: boolean;
    user?: AuthUser;
    message?: string;
  }> {
    try {
      await connectDB();

      const user = await User.findById(id);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const userData: AuthUser = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        status: user.status,
        preferences: user.preferences,
        addresses: user.addresses,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };

      return {
        success: true,
        user: userData,
      };
    } catch (error) {
      console.error("Get user error:", error);
      return {
        success: false,
        message: "Failed to get user data",
      };
    }
  }

  static async verifyEmail(token: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await connectDB();

      let user;
      if (token.length === 6) {
        const upperCode = token.toUpperCase();
        console.log("Looking for user with code:", upperCode);

        const escapedCode = upperCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        user = await User.findOne({
          emailVerificationToken: { $regex: `^${escapedCode}`, $options: "i" },
        });

        console.log("Found user:", user ? "Yes" : "No");
        if (user) {
          console.log(
            "User token starts with:",
            user.emailVerificationToken?.substring(0, 6)
          );
        }
      } else {
        user = await User.findOne({
          emailVerificationToken: token,
        });
      }

      if (!user) {
        return {
          success: false,
          message: "Invalid verification code",
        };
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return {
        success: true,
        message: "Email verified successfully",
      };
    } catch (error) {
      console.error("Email verification error:", error);
      return {
        success: false,
        message: "Failed to verify email",
      };
    }
  }

  static async resendVerificationEmail(email: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      await connectDB();

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      if (user.isEmailVerified) {
        return {
          success: false,
          message: "Email is already verified",
        };
      }

      const emailVerificationToken =
        VerificationUtils.generateVerificationToken();
      const emailVerificationExpires =
        VerificationUtils.getVerificationExpiry();

      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationExpires = emailVerificationExpires;
      await user.save();

      const emailResult = await EmailService.sendEmailVerificationEmail(
        user.email,
        user.firstName,
        emailVerificationToken
      );

      if (emailResult.success) {
        return {
          success: true,
          message: "Verification email sent successfully",
        };
      } else {
        return {
          success: false,
          message: "Failed to send verification email",
        };
      }
    } catch (error) {
      console.error("Resend verification email error:", error);
      return {
        success: false,
        message: "Failed to resend verification email",
      };
    }
  }
}
