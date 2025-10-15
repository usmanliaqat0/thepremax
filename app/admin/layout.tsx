"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";
import { canAccessRoute } from "@/lib/admin-permissions";
import { PermissionProvider } from "@/context/PermissionContext";

function isAdminUser(userRole?: string): boolean {
  return ["super_admin", "admin"].includes(userRole || "");
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.log("Admin layout effect:", {
      isLoading: state.isLoading,
      isAuthenticated: state.isAuthenticated,
      userRole: state.user?.role,
      userPermissions: state.user?.permissions,
      pathname,
    });

    // Skip authentication checks for admin login page
    if (pathname === "/admin/login") {
      console.log("On admin login page, skipping auth checks");
      setIsLoading(false);
      return;
    }

    if (!state.isLoading) {
      if (!state.isAuthenticated) {
        console.log("Not authenticated, redirecting to admin login");
        router.push("/admin/login");
        return;
      }

      if (!isAdminUser(state.user?.role)) {
        console.log("Not an admin user, redirecting to home");
        router.push("/");
        return;
      }

      // Check route permissions
      const hasRouteAccess = state.user
        ? canAccessRoute(state.user, pathname)
        : false;
      console.log("Route access check:", { pathname, hasRouteAccess });

      if (!hasRouteAccess) {
        console.log("No route access, redirecting to admin dashboard");
        router.push("/admin");
        return;
      }

      console.log("All checks passed, setting loading to false");
      setIsLoading(false);
    }
  }, [state.isAuthenticated, state.isLoading, state.user, pathname, router]);

  // Skip loading and auth checks for admin login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (state.isLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated || !isAdminUser(state.user?.role)) {
    return null;
  }

  return (
    <PermissionProvider>
      <div className="h-screen bg-background flex overflow-hidden">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col lg:ml-0">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-background/50">
            <div className="p-3 sm:p-4 lg:p-6 xl:p-8">{children}</div>
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}
