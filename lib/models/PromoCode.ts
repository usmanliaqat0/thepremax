import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPromoCode extends Document {
  _id: Types.ObjectId;
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number; // percentage (0-100) or fixed amount
  minimumAmount?: number; // minimum order amount to apply
  maximumDiscount?: number; // maximum discount amount (for percentage)
  usageLimit?: number; // total usage limit
  usedCount: number; // current usage count
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    maximumDiscount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
// Note: code field already has unique index from unique: true
PromoCodeSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
PromoCodeSchema.index({ usedCount: 1, usageLimit: 1 });

// Virtual for checking if promo code is valid
PromoCodeSchema.virtual("isValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validUntil >= now &&
    (!this.usageLimit || this.usedCount < this.usageLimit)
  );
});

// Virtual for remaining usage count
PromoCodeSchema.virtual("remainingUsage").get(function () {
  if (!this.usageLimit) return null;
  return Math.max(0, this.usageLimit - this.usedCount);
});

PromoCodeSchema.set("toJSON", { virtuals: true });
PromoCodeSchema.set("toObject", { virtuals: true });

// Pre-save validation
PromoCodeSchema.pre("save", function (next) {
  // Validate value based on type
  if (this.type === "percentage" && this.value > 100) {
    return next(new Error("Percentage value cannot exceed 100"));
  }

  // Validate date range
  if (this.validFrom >= this.validUntil) {
    return next(new Error("Valid from date must be before valid until date"));
  }

  // Validate usage limit
  if (this.usageLimit && this.usedCount > this.usageLimit) {
    return next(new Error("Used count cannot exceed usage limit"));
  }

  next();
});

let PromoCode: mongoose.Model<IPromoCode> | Record<string, never>;

if (typeof window === "undefined") {
  PromoCode =
    mongoose.models.PromoCode ||
    mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);
} else {
  PromoCode = {};
}

export default PromoCode;
