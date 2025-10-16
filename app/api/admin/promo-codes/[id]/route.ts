import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-handler";
import connectDB from "@/lib/db";
import PromoCode from "@/lib/models/PromoCode";
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid promo code ID" },
        { status: 400 }
      );
    }

    const promoCode = await PromoCode.findById(id).lean();

    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promoCode,
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid promo code ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      code,
      description,
      type,
      value,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive,
    } = body;

    // Validation
    if (type === "percentage" && value > 100) {
      return NextResponse.json(
        { success: false, message: "Percentage value cannot exceed 100" },
        { status: 400 }
      );
    }

    if (
      validFrom &&
      validUntil &&
      new Date(validFrom) >= new Date(validUntil)
    ) {
      return NextResponse.json(
        { success: false, message: "Valid from date must be before valid until date",
        },
        { status: 400 }
      );
    }

    // Check if code already exists (excluding current promo code)
    if (code) {
      const existingPromoCode = await PromoCode.findOne({
        code: code.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingPromoCode) {
        return NextResponse.json(
          { success: false, message: "Promo code already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (minimumAmount !== undefined) updateData.minimumAmount = minimumAmount;
    if (maximumDiscount !== undefined)
      updateData.maximumDiscount = maximumDiscount;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom);
    if (validUntil !== undefined) updateData.validUntil = new Date(validUntil);
    if (isActive !== undefined) updateData.isActive = isActive;

    const promoCode = await PromoCode.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promoCode,
      message: "Promo code updated successfully",
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid promo code ID" },
        { status: 400 }
      );
    }

    const promoCode = await PromoCode.findByIdAndDelete(id);

    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: "Promo code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Promo code deleted successfully",
    });
  } catch (error) {
    return handleApiError(error, "Failed to process request");
  }
}
