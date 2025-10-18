import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: "admin";
  permissions: {
    // Dashboard permissions
    dashboard: {
      view: boolean;
    };
    // User management permissions
    users: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
      export: boolean;
    };
    // Product management permissions
    products: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
      export: boolean;
    };
    // Category management permissions
    categories: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    };
    // Order management permissions
    orders: {
      view: boolean;
      update: boolean;
      delete: boolean;
      export: boolean;
    };
    // Promo code management permissions
    promoCodes: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    };
    // Subscription management permissions
    subscriptions: {
      view: boolean;
      update: boolean;
      export: boolean;
    };
    // Message management permissions
    messages: {
      view: boolean;
      update: boolean;
      delete: boolean;
    };
    // Admin management permissions (only for super admin)
    admins: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    };
    // Statistics permissions
    stats: {
      view: boolean;
      export: boolean;
    };
  };
  status: "active" | "inactive" | "suspended";
  lastLogin?: Date;
  createdBy?: Types.ObjectId; // Reference to the admin who created this admin
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
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
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["admin"],
      required: true,
      default: "admin",
    },
    permissions: {
      dashboard: {
        view: { type: Boolean, default: true },
      },
      users: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
      },
      products: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
      },
      categories: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      orders: {
        view: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
      },
      promoCodes: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      subscriptions: {
        view: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
      },
      messages: {
        view: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      admins: {
        view: { type: Boolean, default: false },
        create: { type: Boolean, default: false },
        update: { type: Boolean, default: false },
        delete: { type: Boolean, default: false },
      },
      stats: {
        view: { type: Boolean, default: false },
        export: { type: Boolean, default: false },
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "archived"],
      default: "active",
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AdminSchema.index({ role: 1 });
AdminSchema.index({ status: 1 });
AdminSchema.index({ createdAt: -1 });

// Pre-save middleware to set default permissions for admin users
AdminSchema.pre("save", function (next) {
  if (this.isNew) {
    // Regular admin users have limited permissions (no admin management)
    this.permissions.users = {
      view: true,
      create: true,
      update: true,
      delete: true,
      export: true,
    };
    this.permissions.products = {
      view: true,
      create: true,
      update: true,
      delete: true,
      export: true,
    };
    this.permissions.categories = {
      view: true,
      create: true,
      update: true,
      delete: true,
    };
    this.permissions.orders = {
      view: true,
      update: true,
      delete: true,
      export: true,
    };
    this.permissions.promoCodes = {
      view: true,
      create: true,
      update: true,
      delete: true,
    };
    this.permissions.subscriptions = {
      view: true,
      update: true,
      export: true,
    };
    this.permissions.messages = { view: true, update: true, delete: true };
    this.permissions.stats = { view: true, export: true };
    // Admins cannot manage other admins - only super admin can do that
    this.permissions.admins = {
      view: false,
      create: false,
      update: false,
      delete: false,
    };
  }
  next();
});

let Admin: mongoose.Model<IAdmin> | Record<string, never>;

if (typeof window === "undefined") {
  Admin = mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);
} else {
  Admin = {};
}

export default Admin;
