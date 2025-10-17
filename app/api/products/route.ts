import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { handleApiError, handleValidationError } from "@/lib/error-handler";
import { productQuerySchema } from "@/lib/validation/schemas";
import { InputSanitizer } from "@/lib/validation/sanitizer";
import { QueryOptimizer } from "@/lib/query-optimizer";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate and sanitize input
    const validationResult = productQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return handleValidationError(
        validationResult.error.issues,
        "Invalid query parameters"
      );
    }

    const {
      search,
      category,
      onSale,
      inStock,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    } = validationResult.data;

    // Build optimized filter
    const filter: Record<string, unknown> = {
      status: status || "active",
    };

    if (search) {
      const sanitizedSearch = InputSanitizer.sanitizeSearchQuery(search);
      filter.$or = [
        { name: { $regex: sanitizedSearch, $options: "i" } },
        { description: { $regex: sanitizedSearch, $options: "i" } },
        { tags: { $in: [new RegExp(sanitizedSearch, "i")] } },
      ];
    }

    if (category) {
      const sanitizedCategoryId = InputSanitizer.sanitizeObjectId(category);
      if (sanitizedCategoryId) {
        filter.categoryId = sanitizedCategoryId;
      }
    }

    if (onSale === "true") {
      filter.onSale = true;
    }

    if (inStock === "true") {
      filter.inStock = true;
    }

    // Use optimized query
    const result = await QueryOptimizer.getProductsOptimized(
      filter,
      page,
      limit,
      sortBy,
      sortOrder
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch products");
  }
}
