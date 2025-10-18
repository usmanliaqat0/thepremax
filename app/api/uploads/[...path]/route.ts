import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import fs from "fs/promises";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePath = resolvedParams.path.join("/");

    // Security check: ensure the path is within uploads directory
    if (
      !filePath.startsWith("avatars/") &&
      !filePath.startsWith("products/") &&
      !filePath.startsWith("categories/")
    ) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Construct the full file path
    const fullPath = path.join(process.cwd(), "public", "uploads", filePath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    // Read the file
    const fileBuffer = await fs.readFile(fullPath);

    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to serve file");
  }
}
