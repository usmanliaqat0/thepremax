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
import { Home, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
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
    <header className="bg-card border-b border-border shadow-sm flex-shrink-0">
      <div className="flex items-center justify-between px-4 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-muted-foreground hidden sm:block mt-1">
              Manage your e-commerce platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="hidden sm:flex"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">View Website</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 lg:h-10 lg:w-10 rounded-full"
              >
                <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                  <AvatarImage src={state.user?.avatar} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs lg:text-sm">
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
