/**
 * Enhanced TypeScript types for Fashion Misst application
 */

import { LucideIcon } from "lucide-react";

// Base types
export type ID = string;
export type Timestamp = string; // ISO string
export type Currency = "PKR" | "USD" | "EUR";
export type Status = "active" | "inactive" | "pending" | "archived";

// User & Authentication
export interface User {
  id: ID;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  preferences: UserPreferences;
  addresses: Address[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: "customer" | "admin" | "staff";
  status: Status;
}

export interface UserPreferences {
  newsletter: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  currency: Currency;
  language: string;
  theme: "light" | "dark" | "auto";
  favoriteCategories: string[];
}

export interface Address {
  id: ID;
  type: "shipping" | "billing";
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Timestamp;
}

// Product & Inventory
export interface ProductVariant {
  id: ID;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price?: number; // Override base price if different
  images?: string[];
}

export interface ProductImage {
  id: ID;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

export interface EnhancedProduct {
  id: ID;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  compareAtPrice?: number;
  currency: Currency;
  category: ProductCategory;
  tags: string[];
  variants: ProductVariant[];
  images: ProductImage[];

  totalSold: number;
  featured: boolean;
  topRated: boolean;
  onSale: boolean;
  status: Status;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

export interface ProductCategory {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: ID;
  order: number;
  status: Status;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Cart & Orders
export interface CartItem {
  id: ID;
  productId: ID;
  variantId: ID;
  quantity: number;
  addedAt: Timestamp;
}

export interface Cart {
  id: ID;
  userId?: ID;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  taxes: number;
  shipping: number;
  discount: number;
  total: number;
  currency: Currency;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
}

export interface OrderItem {
  id: ID;
  productId: ID;
  productName: string;
  productImage: string;
  variantId: ID;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: ID;
  orderNumber: string;
  userId: ID;
  items: OrderItem[];
  subtotal: number;
  taxes: number;
  shipping: number;
  discount: number;
  total: number;
  currency: Currency;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

export type PaymentMethod =
  | "card"
  | "cod" // Cash on Delivery
  | "bank_transfer"
  | "digital_wallet";

// Wishlist
export interface WishlistItem {
  id: ID;
  productId: ID;
  addedAt: Timestamp;
}

export interface Wishlist {
  id: ID;
  userId: ID;
  items: WishlistItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Navigation & UI
export interface NavigationItem {
  id: ID;
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string;
  children?: NavigationItem[];
  order: number;
  isActive?: boolean;
  isExternal?: boolean;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

// API & State Management
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationData;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  lastFetch?: Timestamp;
}

// Feature Components
export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface StatItem {
  value: string | number;
  label: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface TestimonialItem {
  id: ID;
  name: string;
  avatar?: string;
  comment: string;
  title?: string;
  location?: string;
  verified: boolean;
}

// Forms
export interface FormField<T = unknown> {
  name: keyof T;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "select"
    | "textarea"
    | "checkbox"
    | "radio"
    | "file"
    | "date";
  placeholder?: string;
  required?: boolean;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: T[keyof T]) => string | null;
  };
  options?: Array<{
    value: string;
    label: string;
  }>;
}

// Search & Filtering
export interface SearchFilters {
  query?: string;
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  sizes?: string[];
  colors?: string[];

  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
}

export interface SortOption {
  value: string;
  label: string;
  order: "asc" | "desc";
}

// Analytics & Tracking
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp: Timestamp;
}

export interface ProductAnalytics {
  views: number;
  addToCart: number;
  purchases: number;
  conversionRate: number;
}

// Newsletter & Communication
export interface NewsletterSubscription {
  id: ID;
  email: string;
  isActive: boolean;
  preferences: {
    newProducts: boolean;
    sales: boolean;
    tips: boolean;
  };
  subscribedAt: Timestamp;
  unsubscribedAt?: Timestamp;
}

// Configuration
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  currency: Currency;
  shipping: {
    freeThreshold: number;
    standardRate: number;
    expressRate: number;
  };
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
