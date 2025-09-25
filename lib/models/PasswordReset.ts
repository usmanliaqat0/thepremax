import mongoose, { Document, Schema, Types } from "mongoose";

// PasswordReset document interface for Mongoose
export interface IPasswordReset extends Document {
  _id: Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// PasswordReset schema
const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
PasswordResetSchema.index({ email: 1, used: 1 });
PasswordResetSchema.index({ token: 1, used: 1 });

// Export the model - only create if we're on the server side
let PasswordReset: mongoose.Model<IPasswordReset> | Record<string, never>;

if (typeof window === "undefined") {
  // Server-side only
  PasswordReset =
    mongoose.models.PasswordReset ||
    mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);
} else {
  // Client-side - export empty object to prevent errors
  PasswordReset = {};
}

export default PasswordReset;
