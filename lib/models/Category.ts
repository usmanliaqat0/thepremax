import mongoose, { Document, Schema, Types } from "mongoose";

// Category document interface for Mongoose
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  status: "active" | "inactive";
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category schema
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
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
  },
  {
    timestamps: true,
  }
);

// Create indexes
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ status: 1, order: 1 });

// Virtual for product count
CategorySchema.virtual("productCount", {
  ref: "Product",
  localField: "_id",
  foreignField: "categoryId",
  count: true,
});

// Ensure virtual fields are serialized
CategorySchema.set("toJSON", { virtuals: true });
CategorySchema.set("toObject", { virtuals: true });

// Pre-save middleware to generate slug
CategorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Export the model - only create if we're on the server side
let Category: mongoose.Model<ICategory> | Record<string, never>;

if (typeof window === "undefined") {
  // Server-side only
  Category =
    mongoose.models.Category ||
    mongoose.model<ICategory>("Category", CategorySchema);
} else {
  // Client-side - export empty object to prevent errors
  Category = {};
}

export default Category;
