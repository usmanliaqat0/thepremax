import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import connectDB from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { AdminMiddleware } from "@/lib/admin-middleware";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    // Ensure Product model is registered for virtual population
    if (!mongoose.models.Product) {
      await import("@/lib/models/Product");
    }

    const { id } = await params;

    const category = await Category.findById(id)
      .populate("productCount")
      .lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    return handleApiError(error, "Failed to process request");
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
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    // Ensure Product model is registered for virtual population
    if (!mongoose.models.Product) {
      await import("@/lib/models/Product");
    }

    const { id } = await params;

    const body = await request.json();
    const {
      name,
      description,
      image,
      order,
      status,
      seoTitle,
      seoDescription,
    } = body;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    if (name && !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingCategory) {
        return NextResponse.json(
          { success: false, message: "Category with this name already exists" },
          { status: 400 }
        );
      }

      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existingSlug = await Category.findOne({
        slug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        return NextResponse.json(
          { success: false, message: "Category with this slug already exists" },
          { status: 400 }
        );
      }

      category.slug = slug;
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (order !== undefined) category.order = order;
    if (status !== undefined) category.status = status;
    if (seoTitle !== undefined) category.seoTitle = seoTitle;
    if (seoDescription !== undefined) category.seoDescription = seoDescription;

    await category.save();

    const updatedCategory = await Category.findById(category._id)
      .populate("subcategories")
      .populate("productCount")
      .lean();

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to process request");
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
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    // Ensure Product model is registered for virtual population
    if (!mongoose.models.Product) {
      await import("@/lib/models/Product");
    }

    const { id } = await params;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const products = await Product.find({ categoryId: id });
    if (products.length > 0) {
      return NextResponse.json(
        { success: false, message:
            "Cannot delete category with products. Please move or delete products first.",
        },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to process request");
  }
}
