import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { AdminMiddleware } from "@/lib/admin-middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      // Return all products without pagination for client-side handling
      const products = await Product.find({})
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        data: products,
      });
    }

    // Original paginated endpoint for backward compatibility
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const featured = searchParams.get("featured") || "";
    const onSale = searchParams.get("onSale") || "";
    const inStock = searchParams.get("inStock") || "";

    const skip = (page - 1) * limit;

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

    const total = await Product.countDocuments(filter);

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
    return handleApiError(error, "Failed to process request");
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
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

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { success: false, message: "Description is required" },
        { status: 400 }
      );
    }

    if (basePrice === undefined || basePrice < 0) {
      return NextResponse.json(
        { success: false, message: "Valid base price is required" },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      );
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 400 }
      );
    }

    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product with this name already exists" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingSlug = await Product.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: "Product with this slug already exists" },
        { status: 400 }
      );
    }

    if (variants.length > 0) {
      const skus = variants.map((v: { sku: string }) => v.sku).filter(Boolean);
      const uniqueSkus = new Set(skus);
      if (skus.length !== uniqueSkus.size) {
        return NextResponse.json(
          { success: false, message: "Duplicate SKUs found in variants" },
          { status: 400 }
        );
      }

      const existingSkus = await Product.find({
        "variants.sku": { $in: skus },
      });
      if (existingSkus.length > 0) {
        return NextResponse.json(
          { success: false, message: "Some SKUs already exist" },
          { status: 400 }
        );
      }
    }

    if (images.length > 0) {
      const hasPrimary = images.some(
        (img: { isPrimary: boolean }) => img.isPrimary
      );
      if (!hasPrimary) {
        images[0].isPrimary = true;
      }
    }

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

    const populatedProduct = await Product.findById(product._id)
      .populate("category", "name slug")
      .lean();

    return NextResponse.json({
      success: true,
      data: populatedProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to process request");
  }
}
