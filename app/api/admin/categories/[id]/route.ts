import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { AdminMiddleware } from "@/lib/admin-middleware";

// GET /api/admin/categories/[id] - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const category = await Category.findById(id)
      .populate("productCount")
      .lean();

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (name && !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    // Check if category with same name already exists (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: "Category with this name already exists" },
          { status: 400 }
        );
      }

      // Generate new slug
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if new slug already exists
      const existingSlug = await Category.findOne({
        slug,
        _id: { $ne: id },
      });
      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: "Category with this slug already exists" },
          { status: 400 }
        );
      }

      category.slug = slug;
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (order !== undefined) category.order = order;
    if (status !== undefined) category.status = status;
    if (seoTitle !== undefined) category.seoTitle = seoTitle;
    if (seoDescription !== undefined) category.seoDescription = seoDescription;

    await category.save();

    // Populate the updated category
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
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has products
    const products = await Product.find({ categoryId: id });
    if (products.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
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
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
