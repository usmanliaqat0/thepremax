import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPasswordReset extends Document {
  _id: Types.ObjectId;
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
      index: { expireAfterSeconds: 0 },
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

PasswordResetSchema.index({ email: 1, used: 1 });
PasswordResetSchema.index({ token: 1, used: 1 });

let PasswordReset: mongoose.Model<IPasswordReset> | Record<string, never>;

if (typeof window === "undefined") {
  PasswordReset =
    mongoose.models.PasswordReset ||
    mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);
} else {
  PasswordReset = {};
}

export default PasswordReset;
