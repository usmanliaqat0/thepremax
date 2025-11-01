"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { AdminPermissions } from "@/lib/types";

interface PermissionContextType {
  permissions: AdminPermissions | null;
  updatePermissions: (newPermissions: AdminPermissions) => void;
  refreshPermissions: () => Promise<void>;
  hasPermission: (section: string, action: string) => boolean;
  isSuperAdmin: () => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);

  // Initialize permissions from user data
  useEffect(() => {
    if (state.user?.permissions) {
      setPermissions(state.user.permissions);
    } else if (state.user?.role === "super_admin") {
      // Super admin has all permissions
      setPermissions({
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
        categories: {
          view: true,
          create: true,
          update: true,
          delete: true,
        },
        orders: {
          view: true,
          update: true,
          delete: true,
          export: true,
        },
        promoCodes: {
          view: true,
          create: true,
          update: true,
          delete: true,
        },
        subscriptions: {
          view: true,
          update: true,
          export: true,
        },
        messages: {
          view: true,
          update: true,
          delete: true,
        },
        admins: {
          view: true,
          create: true,
          update: true,
          delete: true,
        },
        stats: {
          view: true,
          export: true,
        },
      });
    }
  }, [state.user]);

  const updatePermissions = (newPermissions: AdminPermissions) => {
    setPermissions(newPermissions);
  };

  const refreshPermissions = async () => {
    try {
      const response = await fetch("/api/admin/auth/profile", {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user?.permissions) {
          setPermissions(result.user.permissions);
        }
      }
    } catch (error) {
      console.error("Error refreshing permissions:", error);
    }
  };

  const hasPermission = (section: string, action: string): boolean => {
    if (!permissions) return false;

    // Super admin has all permissions
    if (
      state.user?.role === "super_admin" &&
      state.user?.id === "super-admin"
    ) {
      return true;
    }

    const sectionPermissions = permissions[section as keyof AdminPermissions];
    if (!sectionPermissions || typeof sectionPermissions !== "object") {
      return false;
    }

    return (sectionPermissions as Record<string, boolean>)[action] === true;
  };

  const isSuperAdmin = (): boolean => {
    return (
      state.user?.role === "super_admin" && state.user?.id === "super-admin"
    );
  };

  const contextValue: PermissionContextType = {
    permissions,
    updatePermissions,
    refreshPermissions,
    hasPermission,
    isSuperAdmin,
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
