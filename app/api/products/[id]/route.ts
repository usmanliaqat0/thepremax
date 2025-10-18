import { NextRequest, NextResponse } from "next/server";
import { withDatabaseOperation } from "@/lib/db";
import Product from "@/lib/models/Product";
import { handleApiError } from "@/lib/error-handler";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await withDatabaseOperation(async () => {
      return await Product.findOne({
        $or: [{ _id: id }, { slug: id }],
        status: "active",
      })
        .populate("category", "name slug")
        .lean();
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch product");
  }
}
