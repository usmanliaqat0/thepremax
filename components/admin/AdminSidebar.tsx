"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Shield,
  Package,
  Tag,
  MessageCircle,
  ShoppingCart,
  X,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Messages",
    href: "/admin/messages",
    icon: MessageCircle,
  },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({
  isOpen = true,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:relative lg:inset-auto lg:w-72 lg:flex-shrink-0 lg:h-screen lg:overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header with close button for mobile */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="ThePreMax"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <div>
                <h1 className="font-bold text-lg">ThePreMax</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-6 py-4 bg-accent/10 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Super Admin
              </span>
            </div>
          </div>

          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-2 px-4">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-6 py-6 border-t border-border">
            <div className="text-xs text-center text-muted-foreground">
              <p className="font-medium">ThePreMax Admin</p>
              <p className="mt-1">
                © {new Date().getFullYear()} All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
