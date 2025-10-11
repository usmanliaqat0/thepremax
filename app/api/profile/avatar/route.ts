import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { TokenUtils, AvatarUtils } from "@/lib/auth-service";
import fs from "fs/promises";
import path from "path";

class FileUploadService {
  private static readonly UPLOAD_DIR = path.join(
    process.cwd(),
    "public",
    "uploads",
    "avatars"
  );
  private static readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024;

  static async validateFile(
    file: File
  ): Promise<{ valid: boolean; message?: string }> {

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        message: "Invalid file type. Only JPG, PNG, and WebP are allowed.",
      };
    }

if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        message: "File size too large. Maximum size is 5MB.",
      };
    }

    return { valid: true };
  }

  static async uploadAvatar(
    file: File,
    userId: string
  ): Promise<{
    success: boolean;
    path?: string;
    message?: string;
  }> {
    try {

      const validation = await this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
        };
      }

await fs.mkdir(this.UPLOAD_DIR, { recursive: true });

const fileExtension = path.extname(file.name);
      const fileName = `user-${userId}-${Date.now()}${fileExtension}`;
      const filePath = path.join(this.UPLOAD_DIR, fileName);

const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.writeFile(filePath, buffer);

const relativePath = `/uploads/avatars/${fileName}`;

      return {
        success: true,
        path: relativePath,
        message: "File uploaded successfully",
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        message: "Failed to upload file",
      };
    }
  }

  static async deleteOldAvatar(avatarPath: string): Promise<void> {
    try {

      if (
        avatarPath.startsWith("/uploads/avatars/") ||
        avatarPath.startsWith("/profile-images/custom/")
      ) {
        const fullPath = path.join(process.cwd(), "public", avatarPath);
        await fs.unlink(fullPath).catch(() => {

        });
      }
    } catch (error) {
      console.error("Error deleting old avatar:", error);

    }
  }
}

function getAuthToken(req: NextRequest): string | null {

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

const cookieToken = req.cookies.get("accessToken")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = TokenUtils.verifyAccessToken(token);

const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

const uploadResult = await FileUploadService.uploadAvatar(file, decoded.id);

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, message: uploadResult.message },
        { status: 400 }
      );
    }

await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

if (
      user.avatar &&
      (user.avatar.startsWith("/uploads/avatars/") ||
        user.avatar.startsWith("/profile-images/custom/"))
    ) {
      await FileUploadService.deleteOldAvatar(user.avatar);
    }

const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { avatar: uploadResult.path },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Avatar updated successfully",
      avatar: updatedUser?.avatar,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Invalid or expired")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {

    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = TokenUtils.verifyAccessToken(token);

    await connectDB();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

if (
      user.avatar &&
      (user.avatar.startsWith("/uploads/avatars/") ||
        user.avatar.startsWith("/profile-images/custom/"))
    ) {
      await FileUploadService.deleteOldAvatar(user.avatar);
    }

const defaultAvatar = AvatarUtils.getDefaultAvatar(user.gender);

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { avatar: defaultAvatar },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Avatar reset to default",
      avatar: updatedUser?.avatar,
    });
  } catch (error) {
    console.error("Avatar reset error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Invalid or expired")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
