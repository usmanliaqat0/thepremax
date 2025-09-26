import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { AdminMiddleware } from "@/lib/admin-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id)
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const {
      name,
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
    } = body;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (name && !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (description && !description.trim()) {
      return NextResponse.json(
        { success: false, error: "Description is required" },
        { status: 400 }
      );
    }

    if (basePrice !== undefined && basePrice < 0) {
      return NextResponse.json(
        { success: false, error: "Valid base price is required" },
        { status: 400 }
      );
    }

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 400 }
        );
      }
    }

    if (name && name !== product.name) {
      const existingProduct = await Product.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingProduct) {
        return NextResponse.json(
          { success: false, error: "Product with this name already exists" },
          { status: 400 }
        );
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existingSlug = await Product.findOne({
        slug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: "Product with this slug already exists" },
          { status: 400 }
        );
      }

      product.slug = slug;
    }

    if (variants && variants.length > 0) {
      const skus = variants.map((v: { sku: string }) => v.sku).filter(Boolean);
      const uniqueSkus = new Set(skus);
      if (skus.length !== uniqueSkus.size) {
        return NextResponse.json(
          { success: false, error: "Duplicate SKUs found in variants" },
          { status: 400 }
        );
      }

      const existingSkus = await Product.find({
        "variants.sku": { $in: skus },
        _id: { $ne: id },
      });
      if (existingSkus.length > 0) {
        return NextResponse.json(
          { success: false, error: "Some SKUs already exist" },
          { status: 400 }
        );
      }
    }

    if (images && images.length > 0) {
      const hasPrimary = images.some(
        (img: { isPrimary: boolean }) => img.isPrimary
      );
      if (!hasPrimary) {
        images[0].isPrimary = true;
      }
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (basePrice !== undefined) product.basePrice = basePrice;
    if (compareAtPrice !== undefined) product.compareAtPrice = compareAtPrice;
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (tags !== undefined) product.tags = tags;
    if (variants !== undefined) product.variants = variants;
    if (images !== undefined) product.images = images;
    if (totalSold !== undefined) product.totalSold = totalSold;
    if (featured !== undefined) product.featured = featured;
    if (topRated !== undefined) product.topRated = topRated;
    if (onSale !== undefined) product.onSale = onSale;
    if (status !== undefined) {
      product.status = status;
      if (status === "active" && !product.publishedAt) {
        product.publishedAt = new Date();
      }
    }
    if (seoTitle !== undefined) product.seoTitle = seoTitle;
    if (seoDescription !== undefined) product.seoDescription = seoDescription;
    if (rating !== undefined) product.rating = rating;
    if (reviewCount !== undefined) product.reviewCount = reviewCount;
    if (specifications !== undefined) product.specifications = specifications;
    if (sizes !== undefined) product.sizes = sizes;
    if (colors !== undefined) product.colors = colors;
    if (inStock !== undefined) product.inStock = inStock;
    if (sourceUrl !== undefined) product.sourceUrl = sourceUrl;

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("category", "name slug")
      .lean();

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
