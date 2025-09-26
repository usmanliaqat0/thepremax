import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

// GET /api/products - Get all active products for frontend
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const featured = searchParams.get("featured") || "";
    const onSale = searchParams.get("onSale") || "";
    const inStock = searchParams.get("inStock") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, unknown> = {
      status: "active", // Only show active products
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category) {
      filter.categoryId = category;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (onSale === "true") {
      filter.onSale = true;
    }

    if (inStock === "true") {
      filter.inStock = true;
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    if (sortBy === "price") {
      sort.basePrice = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "name") {
      sort.name = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "rating") {
      sort.rating = sortOrder === "asc" ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // Get total count
    const total = await Product.countDocuments(filter);

    // Get products with population
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
