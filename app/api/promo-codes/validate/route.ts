import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PromoCode from "@/lib/models/PromoCode";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { code, subtotal = 0 } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Promo code is required" },
        { status: 400 }
      );
    }

    // Find the promo code
    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
    }).lean();

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: "Invalid promo code" },
        { status: 404 }
      );
    }

    // Check if promo code is valid
    const now = new Date();
    const isValid =
      promoCode.isActive &&
      promoCode.validFrom <= now &&
      promoCode.validUntil >= now &&
      (!promoCode.usageLimit || promoCode.usedCount < promoCode.usageLimit);

    if (!isValid) {
      let errorMessage = "Promo code is not valid";
      if (!promoCode.isActive) {
        errorMessage = "Promo code is inactive";
      } else if (promoCode.validFrom > now) {
        errorMessage = "Promo code is not yet active";
      } else if (promoCode.validUntil < now) {
        errorMessage = "Promo code has expired";
      } else if (
        promoCode.usageLimit &&
        promoCode.usedCount >= promoCode.usageLimit
      ) {
        errorMessage = "Promo code usage limit reached";
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    // Check minimum amount requirement
    if (promoCode.minimumAmount && subtotal < promoCode.minimumAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount of $${promoCode.minimumAmount} required`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (promoCode.type === "percentage") {
      discount = (subtotal * promoCode.value) / 100;
      if (promoCode.maximumDiscount && discount > promoCode.maximumDiscount) {
        discount = promoCode.maximumDiscount;
      }
    } else {
      discount = Math.min(promoCode.value, subtotal);
    }

    return NextResponse.json({
      success: true,
      data: {
        code: promoCode.code,
        description: promoCode.description,
        type: promoCode.type,
        value: promoCode.value,
        discount: Math.round(discount * 100) / 100,
        minimumAmount: promoCode.minimumAmount,
        maximumDiscount: promoCode.maximumDiscount,
      },
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate promo code" },
      { status: 500 }
    );
  }
}
