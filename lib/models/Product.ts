import mongoose, { Document, Schema, Types } from "mongoose";

// Product variant interface
export interface IProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price?: number;
  images?: string[];
}

// Product image interface
export interface IProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

// Product document interface for Mongoose
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  categoryId: Types.ObjectId;
  tags: string[];
  variants: IProductVariant[];
  images: IProductImage[];
  totalSold: number;
  featured: boolean;
  topRated: boolean;
  onSale: boolean;
  status: "active" | "inactive" | "pending" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  rating: number;
  reviewCount: number;
  specifications?: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Product schema
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    variants: [
      {
        id: { type: String, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        sku: { type: String, required: true, unique: true },
        stock: { type: Number, required: true, min: 0 },
        price: { type: Number, min: 0 },
        images: [{ type: String }],
      },
    ],
    images: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
        alt: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        variant: {
          size: String,
          color: String,
        },
      },
    ],
    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    topRated: {
      type: Boolean,
      default: false,
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "archived"],
      default: "active",
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    specifications: [
      {
        type: String,
        trim: true,
      },
    ],
    sizes: [
      {
        type: String,
        trim: true,
      },
    ],
    colors: [
      {
        type: String,
        trim: true,
      },
    ],
    inStock: {
      type: Boolean,
      default: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
ProductSchema.index({ name: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ categoryId: 1, status: 1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ featured: 1, status: 1 });
ProductSchema.index({ topRated: 1, status: 1 });
ProductSchema.index({ onSale: 1, status: 1 });
ProductSchema.index({ inStock: 1, status: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ createdAt: -1 });

// Virtual for category
ProductSchema.virtual("category", {
  ref: "Category",
  localField: "categoryId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for discount percentage
ProductSchema.virtual("discountPercentage").get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.basePrice) {
    return Math.round(
      ((this.compareAtPrice - this.basePrice) / this.compareAtPrice) * 100
    );
  }
  return 0;
});

// Virtual for is on sale
ProductSchema.virtual("isOnSale").get(function () {
  return (
    this.onSale || (this.compareAtPrice && this.compareAtPrice > this.basePrice)
  );
});

// Ensure virtual fields are serialized
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

// Pre-save middleware to generate slug
ProductSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Set publishedAt when status changes to active
  if (
    this.isModified("status") &&
    this.status === "active" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  next();
});

// Export the model - only create if we're on the server side
let Product: mongoose.Model<IProduct> | Record<string, never>;

if (typeof window === "undefined") {
  // Server-side only
  Product =
    mongoose.models.Product ||
    mongoose.model<IProduct>("Product", ProductSchema);
} else {
  // Client-side - export empty object to prevent errors
  Product = {};
}

export default Product;
