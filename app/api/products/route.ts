import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { productQuerySchema } from "@/lib/validation/schemas";
import { InputSanitizer } from "@/lib/validation/sanitizer";
import { QueryOptimizer } from "@/lib/query-optimizer";
import { ApiResponseBuilder } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate and sanitize input
    const validationResult = productQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        code: "VALIDATION_ERROR",
        message: issue.message,
        field: issue.path.join("."),
      }));

      return ApiResponseBuilder.validationError(
        "Invalid query parameters",
        errors
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

    return ApiResponseBuilder.success(
      result.data,
      "Products fetched successfully",
      200,
      result.pagination
    );
  } catch (error) {
    return ApiResponseBuilder.internalError(
      "Failed to fetch products",
      error as Error
    );
  }
}
