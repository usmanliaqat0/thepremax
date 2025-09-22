import fs from "fs/promises";
import path from "path";

export interface UploadConfig {
  allowedTypes: string[];
  maxFileSize: number;
  uploadPath: string;
  generateFilename?: (originalName: string, userId?: string) => string;
}

export interface UploadResult {
  success: boolean;
  path?: string;
  filename?: string;
  message?: string;
  size?: number;
}

export class FileUploadService {
  private static readonly BASE_UPLOAD_DIR = path.join(
    process.cwd(),
    "public",
    "uploads"
  );

  static readonly CONFIGS = {
    AVATAR: {
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      maxFileSize: 5 * 1024 * 1024,
      uploadPath: "avatars",
      generateFilename: (originalName: string, userId?: string) => {
        const ext = path.extname(originalName);
        return `user-${userId}-${Date.now()}${ext}`;
      },
    },
    PRODUCT: {
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      maxFileSize: 10 * 1024 * 1024,
      uploadPath: "products",
      generateFilename: (originalName: string) => {
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);
        return `${baseName}-${Date.now()}${ext}`;
      },
    },
    DOCUMENT: {
      allowedTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      maxFileSize: 25 * 1024 * 1024,
      uploadPath: "documents",
      generateFilename: (originalName: string, userId?: string) => {
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);
        return `${baseName}-${
          userId ? `user-${userId}-` : ""
        }${Date.now()}${ext}`;
      },
    },
  } as const;

  static validateFile(
    file: File,
    config: UploadConfig
  ): { valid: boolean; message?: string } {
    if (!config.allowedTypes.includes(file.type)) {
      const allowedExtensions = config.allowedTypes
        .map((type) => type.split("/")[1])
        .join(", ");
      return {
        valid: false,
        message: `Invalid file type. Only ${allowedExtensions} files are allowed.`,
      };
    }

    if (file.size > config.maxFileSize) {
      const maxSizeMB = (config.maxFileSize / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        message: `File size too large. Maximum size is ${maxSizeMB}MB.`,
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        message: "File is empty.",
      };
    }

    return { valid: true };
  }

  static async uploadFile(
    file: File,
    config: UploadConfig,
    userId?: string
  ): Promise<UploadResult> {
    try {
      const validation = this.validateFile(file, config);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      const uploadDir = path.join(this.BASE_UPLOAD_DIR, config.uploadPath);
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = config.generateFilename
        ? config.generateFilename(file.name, userId)
        : `${Date.now()}-${file.name}`;

      const filePath = path.join(uploadDir, filename);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.writeFile(filePath, buffer);

      const relativePath = `/uploads/${config.uploadPath}/${filename}`;

      return {
        success: true,
        path: relativePath,
        filename,
        size: file.size,
        message: "File uploaded successfully",
      };
    } catch (error) {
      console.error("File upload error:", error);
      return {
        success: false,
        message: "Failed to upload file",
      };
    }
  }

  static async deleteFile(
    filePath: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!filePath.startsWith("/uploads/")) {
        return {
          success: false,
          message: "Invalid file path",
        };
      }

      const fullPath = path.join(process.cwd(), "public", filePath);

      try {
        await fs.access(fullPath);
      } catch {
        return {
          success: false,
          message: "File not found",
        };
      }

      await fs.unlink(fullPath);

      return {
        success: true,
        message: "File deleted successfully",
      };
    } catch (error) {
      console.error("File deletion error:", error);
      return {
        success: false,
        message: "Failed to delete file",
      };
    }
  }

  static async moveFile(
    tempPath: string,
    permanentPath: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (
        !tempPath.startsWith("/uploads/temp/") ||
        !permanentPath.startsWith("/uploads/")
      ) {
        return {
          success: false,
          message: "Invalid file paths",
        };
      }

      const sourcePath = path.join(process.cwd(), "public", tempPath);
      const destPath = path.join(process.cwd(), "public", permanentPath);

      await fs.mkdir(path.dirname(destPath), { recursive: true });

      await fs.rename(sourcePath, destPath);

      return {
        success: true,
        message: "File moved successfully",
      };
    } catch (error) {
      console.error("File move error:", error);
      return {
        success: false,
        message: "Failed to move file",
      };
    }
  }

  static async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    size?: number;
    modified?: Date;
    message?: string;
  }> {
    try {
      if (!filePath.startsWith("/uploads/")) {
        return {
          exists: false,
          message: "Invalid file path",
        };
      }

      const fullPath = path.join(process.cwd(), "public", filePath);
      const stats = await fs.stat(fullPath);

      return {
        exists: true,
        size: stats.size,
        modified: stats.mtime,
      };
    } catch {
      return {
        exists: false,
        message: "File not found",
      };
    }
  }

  /**
   * Clean up old temporary files
   */
  static async cleanupTempFiles(maxAgeHours = 24): Promise<void> {
    try {
      const tempDir = path.join(this.BASE_UPLOAD_DIR, "temp");

      try {
        const files = await fs.readdir(tempDir);
        const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;

        for (const file of files) {
          const filePath = path.join(tempDir, file);
          const stats = await fs.stat(filePath);

          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
            console.log(`Cleaned up temp file: ${file}`);
          }
        }
      } catch {
        // Temp directory doesn't exist or is empty, which is fine
      }
    } catch (error) {
      console.error("Temp cleanup error:", error);
    }
  }
}
