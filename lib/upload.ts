import fs from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

export interface UploadResult {
  success: boolean;
  path?: string;
  message: string;
}

export async function handleImageUpload(
  req: NextRequest,
  userId: string
): Promise<UploadResult> {
  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return { success: false, message: "No file provided" };
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: "Invalid file type. Only JPG, PNG, and WebP are allowed.",
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        message: "File size too large. Maximum size is 5MB.",
      };
    }

    // Create directory if it doesn't exist
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "profile-images",
      "custom"
    );
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `user-${userId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    // Return relative path for database storage
    const relativePath = `/profile-images/custom/${fileName}`;

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
