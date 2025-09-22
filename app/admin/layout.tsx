"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";

// Client-side admin check function
function isAdminUser(userRole?: string): boolean {
  return userRole === "admin";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication and admin role
    if (!state.isLoading) {
      if (!state.isAuthenticated) {
        router.push("/login");
        return;
      }

      if (!isAdminUser(state.user?.role)) {
        router.push("/");
        return;
      }

      setIsLoading(false);
    }
  }, [state.isAuthenticated, state.isLoading, state.user?.role, router]);

  if (state.isLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated || !isAdminUser(state.user?.role)) {
    return null; // Will redirect before this renders
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="pl-64">
        <AdminHeader />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}