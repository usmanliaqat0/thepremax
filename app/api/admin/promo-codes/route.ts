import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import connectDB from "@/lib/db";
import PromoCode from "@/lib/models/PromoCode";
import { AdminMiddleware } from "@/lib/admin-middleware";

export async function GET(request: NextRequest) {
  try {
    const authResult = await AdminMiddleware.verifyAdminToken(request);
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
      // Return all promo codes without pagination for client-side handling
      const promoCodes = await PromoCode.find({})
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        data: promoCodes,
      });
    }

    // Paginated endpoint
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      if (status === "active") {
        const now = new Date();
        filter.isActive = true;
        filter.validFrom = { $lte: now };
        filter.validUntil = { $gte: now };
      } else if (status === "inactive") {
        filter.isActive = false;
      } else if (status === "expired") {
        const now = new Date();
        filter.validUntil = { $lt: now };
      } else if (status === "upcoming") {
        const now = new Date();
        filter.validFrom = { $gt: now };
      }
    }

    if (type) {
      filter.type = type;
    }

    const total = await PromoCode.countDocuments(filter);

    const promoCodes = await PromoCode.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: promoCodes,
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
    const authResult = await AdminMiddleware.verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      code,
      description,
      type,
      value,
      minimumAmount = 0,
      maximumDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive = true,
    } = body;

    // Validation
    if (!code || !type || value === undefined || !validFrom || !validUntil) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields: code, type, value, validFrom, validUntil",
        },
        { status: 400 }
      );
    }

    if (type === "percentage" && value > 100) {
      return NextResponse.json(
        { success: false, message: "Percentage value cannot exceed 100" },
        { status: 400 }
      );
    }

    if (new Date(validFrom) >= new Date(validUntil)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid from date must be before valid until date",
        },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingPromoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
    });

    if (existingPromoCode) {
      return NextResponse.json(
        { success: false, message: "Promo code already exists" },
        { status: 400 }
      );
    }

    const promoCode = await PromoCode.create({
      code: code.toUpperCase(),
      description,
      type,
      value,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isActive,
    });

    const populatedPromoCode = await PromoCode.findById(promoCode._id).lean();

    return NextResponse.json({
      success: true,
      data: populatedPromoCode,
      message: "Promo code created successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to process request");
  }
}
