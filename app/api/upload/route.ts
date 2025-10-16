import { NextRequest, NextResponse } from "next/server";
import { saveFile, validateImageFile } from "@/lib/file-upload";
import { handleApiError } from "@/lib/error-handler";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    const uploadedFile = await saveFile(file, folder);

    return NextResponse.json({
      success: true,
      data: uploadedFile,
    });
  } catch (error) {
    return handleApiError(error, "Upload failed");
  }
}
