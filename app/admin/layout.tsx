"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
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
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated || !isAdminUser(state.user?.role)) {
    return null;
  }

  return (
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
  );
}
