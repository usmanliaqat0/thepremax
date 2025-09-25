import mongoose, { Document, Schema, Types } from "mongoose";

// User document interface for Mongoose
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role: "customer" | "admin" | "staff";
  status: "active" | "inactive" | "pending" | "archived";
  preferences: {
    currency: "USD" | "EUR" | "PKR";
    language: string;
    theme: "light" | "dark" | "auto";
    favoriteCategories: string[];
  };
  addresses: Array<{
    id: string;
    type: "shipping" | "billing";
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "archived"],
      default: "active",
    },
    preferences: {
      currency: { type: String, enum: ["USD", "EUR", "PKR"], default: "USD" },
      language: { type: String, default: "en" },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
      favoriteCategories: [{ type: String }],
    },
    addresses: [
      {
        id: { type: String, required: true },
        type: { type: String, enum: ["shipping", "billing"], required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes (email index is already created by unique: true)
UserSchema.index({ createdAt: -1 });
UserSchema.index({ status: 1 });

// Export the model - only create if we're on the server side
let User: mongoose.Model<IUser> | Record<string, never>;

if (typeof window === "undefined") {
  // Server-side only
  User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
} else {
  // Client-side - export empty object to prevent errors
  User = {};
}

export default User;
