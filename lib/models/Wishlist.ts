import mongoose, { Document, Schema } from "mongoose";

export interface IWishlistItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  inStock: boolean;
  discount?: number;
  size?: string;
  color?: string;
  dateAdded: Date;
}

export interface IWishlist extends Document {
  userId: string;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  category: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  discount: { type: Number },
  size: { type: String },
  color: { type: String },
  dateAdded: { type: Date, default: Date.now },
});

const WishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [WishlistItemSchema],
  },
  {
    timestamps: true,
  }
);

WishlistSchema.index({ "items.productId": 1 });

const Wishlist =
  mongoose.models.Wishlist ||
  mongoose.model<IWishlist>("Wishlist", WishlistSchema);
export default Wishlist;
