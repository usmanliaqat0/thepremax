import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { AdminMiddleware } from "@/lib/admin-middleware";

// GET /api/admin/products - Get all products with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const featured = searchParams.get("featured") || "";
    const onSale = searchParams.get("onSale") || "";
    const inStock = searchParams.get("inStock") || "";

    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (featured !== "") {
      filter.featured = featured === "true";
    }

    if (onSale !== "") {
      filter.onSale = onSale === "true";
    }

    if (inStock !== "") {
      filter.inStock = inStock === "true";
    }

    // Get total count
    const total = await Product.countDocuments(filter);

    // Get products with population
    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
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

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      name,
      description,
      basePrice,
      compareAtPrice,
      categoryId,
      tags = [],
      variants = [],
      images = [],
      totalSold = 0,
      featured = false,
      topRated = false,
      onSale = false,
      status = "active",
      seoTitle,
      seoDescription,
      rating = 0,
      reviewCount = 0,
      specifications = [],
      sizes = [],
      colors = [],
      inStock = true,
      sourceUrl,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, error: "Description is required" },
        { status: 400 }
      );
    }

    if (basePrice === undefined || basePrice < 0) {
      return NextResponse.json(
        { success: false, error: "Valid base price is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 400 }
      );
    }

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product with this name already exists" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, error: "Product with this slug already exists" },
        { status: 400 }
      );
    }

    // Validate variants
    if (variants.length > 0) {
      const skus = variants.map((v: { sku: string }) => v.sku).filter(Boolean);
      const uniqueSkus = new Set(skus);
      if (skus.length !== uniqueSkus.size) {
        return NextResponse.json(
          { success: false, error: "Duplicate SKUs found in variants" },
          { status: 400 }
        );
      }

      // Check if SKUs already exist
      const existingSkus = await Product.find({
        "variants.sku": { $in: skus },
      });
      if (existingSkus.length > 0) {
        return NextResponse.json(
          { success: false, error: "Some SKUs already exist" },
          { status: 400 }
        );
      }
    }

    // Set primary image
    if (images.length > 0) {
      const hasPrimary = images.some(
        (img: { isPrimary: boolean }) => img.isPrimary
      );
      if (!hasPrimary) {
        images[0].isPrimary = true;
      }
    }

    // Create new product
    const product = await Product.create({
      name,
      slug,
      description,
      basePrice,
      compareAtPrice,
      categoryId,
      tags,
      variants,
      images,
      totalSold,
      featured,
      topRated,
      onSale,
      status,
      seoTitle,
      seoDescription,
      rating,
      reviewCount,
      specifications,
      sizes,
      colors,
      inStock,
      sourceUrl,
      publishedAt: status === "active" ? new Date() : undefined,
    });

    // Populate the created product
    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name slug")
      .lean();

    return NextResponse.json({
      success: true,
      data: populatedProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
