// Shared types for the application

export interface AdminPermissions {
  dashboard: { view: boolean };
  users: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  };
  products: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    export: boolean;
  };
  categories: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  orders: { view: boolean; update: boolean; delete: boolean; export: boolean };
  promoCodes: {
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  subscriptions: { view: boolean; update: boolean; export: boolean };
  messages: { view: boolean; update: boolean; delete: boolean };
  admins: { view: boolean; create: boolean; update: boolean; delete: boolean };
  stats: { view: boolean; export: boolean };
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  categoryId: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  variants?: Array<{
    id: string;
    size: string;
    color: string;
    sku: string;
    stock: number;
    price: number;
    images: string[];
  }>;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
  }>;
  totalSold: number;
  featured: boolean;
  topRated: boolean;
  onSale: boolean;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
  rating: number;
  reviewCount: number;
  specifications: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  status: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface Address {
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
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: "customer" | "admin" | "staff" | "super_admin";
  status: "active" | "inactive" | "pending" | "archived";
  preferences: {
    currency: "USD" | "EUR" | "PKR";
    language: string;
    theme: "light" | "dark" | "auto";
    favoriteCategories: string[];
  };
  addresses: Address[];
  permissions?: AdminPermissions;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export type AuthUser = User;

export interface SigninData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender?: "male" | "female" | "other";
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  requiresVerification?: boolean;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    growth: string;
    activeGrowth: string;
  };
  verification: {
    emailVerified: number;
    phoneVerified: number;
    emailGrowth: string;
    phoneGrowth: string;
  };
  orders: {
    total: number;
    totalRevenue: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    growth: string;
    revenueGrowth: string;
  };
  recentUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  }>;
}
