"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { Bell, Home, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const { state, logout } = useAuth();
  const pathname = usePathname();

  const getPageTitle = () => {
    const routes: Record<string, string> = {
      "/admin": "Dashboard",
      "/admin/users": "User Management",
      "/admin/products": "Product Management",
      "/admin/orders": "Order Management",
      "/admin/categories": "Category Management",
      "/admin/wishlists": "Wishlist Management",
      "/admin/analytics": "Analytics & Reports",
      "/admin/settings": "Settings",
    };

    return routes[pathname] || "Admin Panel";
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your e-commerce platform
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              View Website
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={state.user?.avatar} />
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    {state.user?.firstName?.charAt(0)}
                    {state.user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {state.user?.firstName} {state.user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {state.user?.email}
                  </p>
                  <p className="text-xs leading-none text-accent font-medium">
                    Super Admin
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
