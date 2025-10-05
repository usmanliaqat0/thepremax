import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEmailSubscription extends Document {
  _id: Types.ObjectId;
  email: string;
  source: "footer" | "newsletter" | "other";
  status: "active" | "unsubscribed" | "bounced";
  subscribedAt: Date;
  unsubscribedAt?: Date;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmailSubscriptionSchema = new Schema<IEmailSubscription>(
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
      index: true,
    },
    source: {
      type: String,
      enum: ["footer", "newsletter", "other"],
      required: true,
      default: "other",
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed", "bounced"],
      default: "active",
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      userAgent: {
        type: String,
        default: null,
      },
      ipAddress: {
        type: String,
        default: null,
      },
      referrer: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance (email index is already defined in schema)
EmailSubscriptionSchema.index({ status: 1 });
EmailSubscriptionSchema.index({ subscribedAt: -1 });
EmailSubscriptionSchema.index({ source: 1 });

let EmailSubscription:
  | mongoose.Model<IEmailSubscription>
  | Record<string, never>;

if (typeof window === "undefined") {
  // Server-side: use the model
  EmailSubscription =
    mongoose.models.EmailSubscription ||
    mongoose.model<IEmailSubscription>(
      "EmailSubscription",
      EmailSubscriptionSchema
    );
} else {
  // Client-side: return empty object
  EmailSubscription = {};
}

export default EmailSubscription;
