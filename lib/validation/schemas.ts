/**
 * Centralized validation schemas using Zod
 */

import { z } from "zod";

// Common schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(12),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const mongoObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

// Product schemas
export const productQuerySchema = z
  .object({
    search: z.string().max(100).optional(),
    category: z.string().max(50).optional(),
    onSale: z.enum(["true", "false"]).optional(),
    inStock: z.enum(["true", "false"]).optional(),
    status: z.enum(["active", "inactive", "pending", "archived"]).optional(),
  })
  .merge(paginationSchema);

export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long").trim(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description too long")
    .trim(),
  basePrice: z.number().min(0, "Price must be non-negative"),
  compareAtPrice: z
    .number()
    .min(0, "Compare price must be non-negative")
    .optional(),
  categoryId: mongoObjectIdSchema,
  tags: z.array(z.string().max(50)).max(20, "Too many tags").default([]),
  variants: z
    .array(
      z.object({
        id: z.string().min(1),
        size: z.string().min(1).max(20),
        color: z.string().min(1).max(30),
        sku: z.string().min(1).max(50),
        stock: z.number().int().min(0),
        price: z.number().min(0).optional(),
        images: z.array(z.string().url()).max(10).default([]),
      })
    )
    .max(50)
    .default([]),
  images: z
    .array(
      z.object({
        id: z.string().min(1),
        url: z.string().url("Invalid image URL"),
        alt: z.string().max(200).default(""),
        isPrimary: z.boolean().default(false),
        order: z.number().int().min(0).default(0),
        variant: z
          .object({
            size: z.string().optional(),
            color: z.string().optional(),
          })
          .optional(),
      })
    )
    .max(20)
    .default([]),
  topRated: z.boolean().default(false),
  onSale: z.boolean().default(false),
  status: z
    .enum(["active", "inactive", "pending", "archived"])
    .default("active"),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().min(0).default(0),
  specifications: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        value: z.string().min(1).max(200),
      })
    )
    .max(50)
    .default([]),
  sizes: z.array(z.string().max(20)).max(20).default([]),
  colors: z.array(z.string().max(30)).max(20).default([]),
  inStock: z.boolean().default(true),
  sourceUrl: z.string().url().optional(),
});

// Order schemas
export const orderCreateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: mongoObjectIdSchema,
        variantId: z.string().optional(),
        quantity: z.number().int().min(1).max(100),
        price: z.number().min(0),
      })
    )
    .min(1, "At least one item required"),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().min(0),
  paymentMethod: z.enum(["cod", "card", "paypal", "stripe"]),
  promoCode: z.string().max(50).optional(),
  discount: z.number().min(0).default(0),
  shippingAddress: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    company: z.string().max(100).optional(),
    address1: z.string().min(1).max(200),
    address2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(20),
    country: z.string().min(1).max(100),
    phone: z.string().max(20).optional(),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
    company: z.string().max(100).optional(),
    address1: z.string().min(1).max(200),
    address2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(20),
    country: z.string().min(1).max(100),
    phone: z.string().max(20).optional(),
  }),
});

// Enhanced date validation
const dateOfBirthSchema = z
  .string()
  .datetime("Invalid date format")
  .refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred this year
    const actualAge =
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

    return actualAge >= 13 && actualAge <= 120;
  }, "Date of birth must be between 13 and 120 years ago");

// Enhanced phone validation
const phoneSchema = z
  .string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
  .min(10, "Phone number too short")
  .max(20, "Phone number too long")
  .optional();

// User schemas
export const userUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long")
    .trim()
    .regex(/^[a-zA-Z\s\-']+$/, "First name contains invalid characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long")
    .trim()
    .regex(/^[a-zA-Z\s\-']+$/, "Last name contains invalid characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(100)
    .toLowerCase()
    .trim(),
  phone: phoneSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z
    .object({
      street: z.string().max(200).min(1, "Street address is required").trim(),
      city: z.string().max(100).min(1, "City is required").trim(),
      state: z.string().max(100).min(1, "State is required").trim(),
      postalCode: z.string().max(20).min(1, "Postal code is required").trim(),
      country: z.string().max(100).min(1, "Country is required").trim(),
    })
    .optional(),
});

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").trim(),
  email: z.string().email("Invalid email address").max(100),
  subject: z.string().max(200, "Subject too long").optional(),
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message too long")
    .trim(),
});

// Promo code schemas
export const promoCodeCreateSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code too long")
    .trim()
    .toUpperCase(),
  description: z.string().max(200, "Description too long").optional(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0, "Value must be non-negative"),
  minimumAmount: z
    .number()
    .min(0, "Minimum amount must be non-negative")
    .default(0),
  maximumDiscount: z
    .number()
    .min(0, "Maximum discount must be non-negative")
    .optional(),
  usageLimit: z
    .number()
    .int()
    .min(1, "Usage limit must be at least 1")
    .optional(),
  validFrom: z.string().datetime("Invalid start date"),
  validUntil: z.string().datetime("Invalid end date"),
  isActive: z.boolean().default(true),
});

// Admin schemas
export const adminCreateSchema = z.object({
  email: z.string().email("Invalid email address").max(100),
  firstName: z.string().min(1, "First name is required").max(50).trim(),
  lastName: z.string().min(1, "Last name is required").max(50).trim(),
  role: z.enum(["admin", "moderator", "viewer"]).default("admin"),
  permissions: z.record(z.string(), z.boolean()).optional(),
});

// Password change schema
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// Email subscription schema
export const emailSubscriptionSchema = z.object({
  email: z.string().email("Invalid email address").max(100),
});
