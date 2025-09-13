import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful! ✅",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "MongoDB connection failed ❌",
        error: error.message,
        errorCode: error.code,
        errorName: error.codeName,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
