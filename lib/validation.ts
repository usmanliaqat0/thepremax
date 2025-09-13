import { z } from "zod";

/**
 * Validation schemas and utilities for the ThePreMax application
 */

// Common validation patterns
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const phoneSchema = z
  .string()
  .regex(/^[\+]?[(]?[\d\s\-\(\)]{10,}$/, "Please enter a valid phone number")
  .min(10, "Phone number must be at least 10 digits");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

// Newsletter subscription
export const newsletterSchema = z.object({
  email: emailSchema,
});

// Contact form
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(100, "Subject must be less than 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

// User registration
export const registrationSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: phoneSchema.optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// User login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

// Shipping address
export const shippingAddressSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be less than 200 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters"),
  postalCode: z.string().regex(/^\d{5}$/, "Postal code must be 5 digits"),
  country: z.string().min(1, "Please select a country"),
  isDefault: z.boolean().optional(),
});

// Payment information
export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, "Card number must be 16 digits")
    .transform((val) => val.replace(/\s/g, "")),
  cardHolder: nameSchema,
  expiryMonth: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, "Please enter a valid month (01-12)"),
  expiryYear: z
    .string()
    .regex(/^\d{4}$/, "Please enter a valid year")
    .refine((year) => {
      const currentYear = new Date().getFullYear();
      const inputYear = parseInt(year);
      return inputYear >= currentYear && inputYear <= currentYear + 20;
    }, "Please enter a valid expiry year"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
});

// Order checkout
export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema.optional(),
  useSameAddress: z.boolean().default(true),
  paymentMethod: z.enum(["card", "cod", "bank"]),
  paymentInfo: paymentSchema.optional(),
  specialInstructions: z
    .string()
    .max(500, "Special instructions must be less than 500 characters")
    .optional(),
});

// Search and filter parameters
export const searchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sort: z
    .enum(["name", "price-low", "price-high", "featured", "newest", "popular"])
    .optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
});

// Type exports for use in components
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ShippingAddressData = z.infer<typeof shippingAddressSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;

export type SearchParamsData = z.infer<typeof searchParamsSchema>;

/**
 * Validation helper functions
 */

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

export function validatePhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push("Use at least 8 characters");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Include uppercase letters");

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push("Include numbers");

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push("Include special characters");

  return { score, feedback };
}

export function formatValidationErrors(
  error: z.ZodError
): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.issues.forEach((err) => {
    const path = err.path.join(".");
    formatted[path] = err.message;
  });

  return formatted;
}
