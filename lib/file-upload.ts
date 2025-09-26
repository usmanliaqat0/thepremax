import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export interface UploadedFile {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
}

export async function saveFile(
  file: File,
  folder: string = "uploads"
): Promise<UploadedFile> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

const uploadsFolder = folder.startsWith("uploads/")
    ? folder
    : `uploads/${folder}`;

const uploadsDir = join(process.cwd(), "public", uploadsFolder);
  await mkdir(uploadsDir, { recursive: true });

const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split(".").pop() || "jpg";
  const filename = `${timestamp}-${randomString}.${extension}`;

  const filepath = join(uploadsDir, filename);
  const url = `/${uploadsFolder}/${filename}`;

  await writeFile(filepath, buffer);

  return {
    filename,
    originalName: file.name,
    path: filepath,
    url,
    size: file.size,
    mimeType: file.type,
  };
}

export async function handleMultipleFiles(
  files: File[],
  folder: string = "uploads"
): Promise<UploadedFile[]> {

  const uploadsFolder = folder.startsWith("uploads/")
    ? folder
    : `uploads/${folder}`;
  const uploadPromises = files.map((file) => saveFile(file, uploadsFolder));
  return Promise.all(uploadPromises);
}

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 5 * 1024 * 1024;
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPEG, PNG, WebP, and GIF images are allowed",
    };
  }

  return { valid: true };
}
