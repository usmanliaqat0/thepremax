import jwt from "jsonwebtoken";
import { AuthUser, AdminPermissions } from "./types";
import connectDB from "./db";
import { PasswordUtils } from "./auth-service";

interface AdminJWTPayload {
  id: string;
  email: string;
  role: string;
  type: "admin";
  permissions?: AdminPermissions;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-here";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key-here";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

export class AdminAuthService {
  static async signin(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    user?: AuthUser;
    accessToken?: string;
    refreshToken?: string | null;
    message?: string;
  }> {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      // Check for super admin first (hardcoded in .env)
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
      const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

      if (
        superAdminEmail &&
        superAdminPassword &&
        normalizedEmail === superAdminEmail.toLowerCase().trim()
      ) {
        if (password === superAdminPassword) {
          const superAdminData: AuthUser = {
            id: "super-admin",
            email: normalizedEmail,
            firstName: "Super",
            lastName: "Admin",
            role: "super_admin",
            avatar: "/profile-images/defaults/admin.svg",
            isEmailVerified: true,
            isPhoneVerified: false,
            status: "active",
            preferences: {
              currency: "USD",
              language: "en",
              theme: "light",
              favoriteCategories: [],
            },
            addresses: [],
            permissions: this.getSuperAdminPermissions(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const accessToken = this.generateAccessToken(superAdminData, {
            permissions: this.getSuperAdminPermissions(),
          });
          const refreshToken = this.generateRefreshToken(superAdminData);

          return {
            success: true,
            user: superAdminData,
            accessToken,
            refreshToken,
            message: "Super admin login successful",
          };
        } else {
          return {
            success: false,
            message: "Invalid super admin credentials",
          };
        }
      }

      // Check regular admins in database
      await connectDB();

      // Import Admin model only on server side
      const { default: Admin } = await import("./models/Admin");

      const admin = await Admin.findOne({
        email: normalizedEmail,
        status: "active",
      }).select("+password");

      if (!admin) {
        return {
          success: false,
          message: "No admin account found with this email address",
        };
      }

      const isPasswordValid = await PasswordUtils.compare(
        password,
        admin.password
      );
      if (!isPasswordValid) {
        return {
          success: false,
          message: "Incorrect password. Please try again.",
        };
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      const adminUserData: AuthUser = {
        id: admin._id.toString(),
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: "admin", // All database admins are regular admins
        avatar: admin.avatar || "/profile-images/defaults/admin.svg",
        isEmailVerified: true,
        isPhoneVerified: false,
        status: admin.status === "suspended" ? "archived" : admin.status,
        preferences: {
          currency: "USD",
          language: "en",
          theme: "light",
          favoriteCategories: [],
        },
        addresses: [],
        permissions: admin.permissions,
        createdAt: admin.createdAt.toISOString(),
        updatedAt: admin.updatedAt.toISOString(),
      };

      const accessToken = this.generateAccessToken(adminUserData, {
        permissions: admin.permissions,
      });
      const refreshToken = this.generateRefreshToken(adminUserData);

      return {
        success: true,
        user: adminUserData,
        accessToken,
        refreshToken,
        message: "Admin login successful",
      };
    } catch (error) {
      console.error("Admin signin error:", error);
      return {
        success: false,
        message: "An error occurred during admin signin",
      };
    }
  }

  static generateAccessToken(
    user: AuthUser,
    additionalData?: Record<string, unknown>
  ): string {
    const payload: AdminJWTPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      type: "admin",
      ...additionalData,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    } as jwt.SignOptions);
  }

  static generateRefreshToken(user: AuthUser): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      type: "admin",
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    } as jwt.SignOptions);
  }

  static verifyAccessToken(token: string): AdminJWTPayload {
    return jwt.verify(token, JWT_SECRET) as AdminJWTPayload;
  }

  static verifyRefreshToken(token: string): AdminJWTPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as AdminJWTPayload;
  }

  static getSuperAdminPermissions() {
    return {
      dashboard: { view: true },
      users: {
        view: true,
        create: true,
        update: true,
        delete: true,
        export: true,
      },
      products: {
        view: true,
        create: true,
        update: true,
        delete: true,
        export: true,
      },
      categories: { view: true, create: true, update: true, delete: true },
      orders: { view: true, update: true, delete: true, export: true },
      promoCodes: { view: true, create: true, update: true, delete: true },
      subscriptions: { view: true, update: true, export: true },
      messages: { view: true, update: true, delete: true },
      admins: { view: true, create: true, update: true, delete: true },
      stats: { view: true, export: true },
    };
  }

  static isSuperAdmin(user: AuthUser): boolean {
    return user.role === "super_admin" && user.id === "super-admin";
  }

  static hasPermission(
    user: AuthUser,
    section: string,
    action: string
  ): boolean {
    // Super admin has all permissions
    if (this.isSuperAdmin(user)) {
      return true;
    }

    // Check regular admin permissions
    const permissions = user.permissions;
    if (!permissions || !permissions[section as keyof AdminPermissions]) {
      return false;
    }
    return (
      (
        permissions[section as keyof AdminPermissions] as Record<
          string,
          boolean
        >
      )[action] === true
    );
  }

  static canAccessRoute(user: AuthUser, route: string): boolean {
    const routePermissions: {
      [key: string]: { section: string; action: string };
    } = {
      "/admin": { section: "dashboard", action: "view" },
      "/admin/users": { section: "users", action: "view" },
      "/admin/products": { section: "products", action: "view" },
      "/admin/categories": { section: "categories", action: "view" },
      "/admin/orders": { section: "orders", action: "view" },
      "/admin/promo-codes": { section: "promoCodes", action: "view" },
      "/admin/subscriptions": { section: "subscriptions", action: "view" },
      "/admin/messages": { section: "messages", action: "view" },
      "/admin/admins": { section: "admins", action: "view" },
    };

    const routePermission = routePermissions[route];
    if (!routePermission) {
      return true; // Allow access to unknown routes
    }

    return this.hasPermission(
      user,
      routePermission.section,
      routePermission.action
    );
  }
}
