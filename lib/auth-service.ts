import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthUser, SigninData, SignupData } from "./types";
import User from "./models/User";
import connectDB from "./db";

interface JWTPayload {
  id: string;
  email: string;
  type: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
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

      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;

      if (
        adminEmail &&
        adminPassword &&
        normalizedEmail === EmailUtils.normalize(adminEmail)
      ) {
        if (password === adminPassword) {
          const adminUserData: AuthUser = {
            id: "admin-super-user",
            email: normalizedEmail,
            firstName: "Super",
            lastName: "Admin",
            role: "admin",
            avatar: AvatarUtils.getDefaultAvatar(),
          };

          const accessToken = TokenUtils.generateAccessToken(adminUserData);
          const refreshToken = TokenUtils.generateRefreshToken(adminUserData);

          return {
            success: true,
            user: adminUserData,
            accessToken,
            refreshToken,
            message: "Admin login successful",
          };
        } else {
          return {
            success: false,
            message: "Invalid admin credentials",
          };
        }
      }

      await connectDB();

      const user = await User.findOne({ email: normalizedEmail }).select(
        "+password"
      );

      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
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
          message: "Invalid email or password",
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

      // Check if user exists
      const normalizedEmail = EmailUtils.normalize(email);
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser) {
        return {
          success: false,
          message: "User with this email already exists",
        };
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hash(password);

      // Create user
      const newUser = new User({
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim(),
        gender,
        avatar: AvatarUtils.getDefaultAvatar(gender),
        preferences: {
          currency: "USD",
          language: "en",
          theme: "light",
          favoriteCategories: [],
        },
      });

      const savedUser = await newUser.save();

      // Prepare user data
      const userData: AuthUser = {
        id: savedUser._id.toString(),
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        gender: savedUser.gender,
        avatar: savedUser.avatar,
        role: savedUser.role,
      };

      // Generate tokens
      const accessToken = TokenUtils.generateAccessToken(userData);
      const refreshToken = TokenUtils.generateRefreshToken(userData);

      return {
        success: true,
        user: userData,
        accessToken,
        refreshToken,
        message: "Account created successfully",
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
      // Verify refresh token
      const decoded = TokenUtils.verifyRefreshToken(refreshToken);

      // Connect to database
      await connectDB();

      // Get current user data
      const user = await User.findById(decoded.id);
      if (!user || user.status !== "active") {
        return {
          success: false,
          message: "User not found or inactive",
        };
      }

      // Prepare user data
      const userData: AuthUser = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        avatar: user.avatar,
        role: user.role,
      };

      // Generate new tokens
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
}
