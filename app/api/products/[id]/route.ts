import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

// GET /api/products/[id] - Get a specific product for frontend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const product = await Product.findOne({
      $or: [{ _id: id }, { slug: id }],
      status: "active",
    })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
