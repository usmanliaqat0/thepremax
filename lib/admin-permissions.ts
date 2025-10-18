// Client-side admin permission utilities
// This file contains permission checking functions that can be used on the client side

import { AdminPermissions, AuthUser } from "./types";

export const isSuperAdmin = (user: AuthUser): boolean => {
  return user.role === "super_admin" && user.id === "super-admin";
};

export const hasPermission = (
  user: AuthUser,
  section: string,
  action: string
): boolean => {
  // Super admin has all permissions
  if (isSuperAdmin(user)) {
    return true;
  }

  // Check regular admin permissions
  const permissions = user.permissions;
  if (!permissions || !permissions[section as keyof AdminPermissions]) {
    return false;
  }
  return (
    (permissions[section as keyof AdminPermissions] as Record<string, boolean>)[
      action
    ] === true
  );
};

const routePermissions: {
  [key: string]: { section: string; action: string };
} = {
  "/admin": { section: "dashboard", action: "view" },
  "/admin/users": { section: "users", action: "view" },
  "/admin/products": { section: "products", action: "view" },
  "/admin/categories": { section: "categories", action: "view" },
  "/admin/orders": { section: "orders", action: "view" },
  "/admin/promo-codes": { section: "promoCodes", action: "view" },
  "/admin/subscriptions": { section: "subscriptions", action: "view" },
  "/admin/messages": { section: "messages", action: "view" },
  "/admin/admins": { section: "admins", action: "view" },
};

export const canAccessRoute = (user: AuthUser, route: string): boolean => {
  const routePermission = routePermissions[route];
  if (!routePermission) {
    return true; // Allow access to unknown routes
  }

  return hasPermission(user, routePermission.section, routePermission.action);
};

export const getSuperAdminPermissions = () => {
  return {
    dashboard: { view: true },
    users: {
      view: true,
      create: true,
      update: true,
      delete: true,
      export: true,
    },
    products: {
      view: true,
      create: true,
      update: true,
      delete: true,
      export: true,
    },
    categories: { view: true, create: true, update: true, delete: true },
    orders: { view: true, update: true, delete: true, export: true },
    promoCodes: { view: true, create: true, update: true, delete: true },
    subscriptions: { view: true, update: true, export: true },
    messages: { view: true, update: true, delete: true },
    admins: { view: true, create: true, update: true, delete: true },
    stats: { view: true, export: true },
  };
};
