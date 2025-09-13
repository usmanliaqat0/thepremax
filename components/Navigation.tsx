"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  Heart,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useRouter, usePathname } from "next/navigation";
import { useMemo, useCallback } from "react";

const Navigation = () => {
  const { getCartItemsCount, state } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  // Memoize categories to prevent recreation on every render
  const categories = useMemo(
    () => [
      { name: "Shirts", href: "/category/shirts" },
      { name: "Perfumes", href: "/category/perfumes" },
    ],
    []
  );

  // Memoize search handler to prevent recreation
  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const searchTerm = e.currentTarget.value;
        if (searchTerm.trim()) {
          router.push(`/shop?search=${encodeURIComponent(searchTerm)}`);
        }
      }
    },
    [router]
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      {/* Promotional Banner */}
      <div className="bg-accent text-accent-foreground text-center py-2 px-4 text-sm font-medium">
        🎉 Free Delivery On Orders Above $50 | Get 15% Off On 3+ Items! 🔥
      </div>

      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/assets/logo.png"
              alt="ThePreMax"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="font-heading font-bold text-xl text-primary">
              ThePreMax
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="nav" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="nav" asChild>
              <Link href="/shop">Shop</Link>
            </Button>

            {/* Categories Dropdown */}
            <div className="relative group">
              <Button variant="nav" className="group">
                Categories
                <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
              </Button>

              {/* Hover Dropdown */}
              <div className="absolute top-full left-0 mt-1 w-48 bg-background border border-border rounded-md shadow-fashion-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Button variant="nav" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="nav" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 bg-muted border-0 focus:bg-background"
                onKeyPress={handleSearch}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex relative"
              asChild
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {state.wishlist.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold min-w-[1.25rem] bg-red-600 text-white border-2 border-background"
                  >
                    {state.wishlist.length}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              asChild
            >
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {getCartItemsCount() > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold min-w-[1.25rem] bg-red-600 text-white border-2 border-background"
                  >
                    {getCartItemsCount()}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center gap-2 p-6 border-b">
                    <Image
                      src="/assets/logo.png"
                      alt="ThePreMax"
                      width={32}
                      height={32}
                      className="rounded"
                    />
                    <span className="font-heading font-bold text-lg">
                      ThePreMax
                    </span>
                  </div>

                  <div className="flex flex-col flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* Mobile Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="search"
                        placeholder="Search products..."
                        className="pl-10"
                        onKeyPress={handleSearch}
                      />
                    </div>

                    {/* Main Navigation */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Navigation
                      </h3>
                      <Button
                        variant={pathname === "/" ? "secondary" : "ghost"}
                        className={`w-full justify-start h-10 text-base transition-colors ${
                          pathname === "/"
                            ? "bg-accent text-accent-foreground font-medium"
                            : ""
                        }`}
                        asChild
                      >
                        <Link href="/">Home</Link>
                      </Button>
                      <Button
                        variant={pathname === "/shop" ? "secondary" : "ghost"}
                        className={`w-full justify-start h-10 text-base transition-colors ${
                          pathname === "/shop"
                            ? "bg-accent text-accent-foreground font-medium"
                            : ""
                        }`}
                        asChild
                      >
                        <Link href="/shop">Shop</Link>
                      </Button>
                      <Button
                        variant={pathname === "/about" ? "secondary" : "ghost"}
                        className={`w-full justify-start h-10 text-base transition-colors ${
                          pathname === "/about"
                            ? "bg-accent text-accent-foreground font-medium"
                            : ""
                        }`}
                        asChild
                      >
                        <Link href="/about">About</Link>
                      </Button>
                      <Button
                        variant={
                          pathname === "/contact" ? "secondary" : "ghost"
                        }
                        className={`w-full justify-start h-10 text-base transition-colors ${
                          pathname === "/contact"
                            ? "bg-accent text-accent-foreground font-medium"
                            : ""
                        }`}
                        asChild
                      >
                        <Link href="/contact">Contact</Link>
                      </Button>
                    </div>

                    {/* Categories */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Categories
                      </h3>
                      {categories.map((category) => (
                        <Button
                          key={category.name}
                          variant={
                            pathname === category.href ? "secondary" : "ghost"
                          }
                          className={`w-full justify-start h-9 text-base pl-4 transition-colors ${
                            pathname === category.href
                              ? "bg-accent text-accent-foreground font-medium"
                              : ""
                          }`}
                          asChild
                        >
                          <Link href={category.href}>{category.name}</Link>
                        </Button>
                      ))}
                    </div>

                    {/* Account & Actions */}
                    <div className="space-y-1 pt-2 border-t">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Account
                      </h3>
                      <Button
                        variant={
                          pathname === "/wishlist" ? "secondary" : "ghost"
                        }
                        className={`w-full justify-start h-10 text-base transition-colors ${
                          pathname === "/wishlist"
                            ? "bg-accent text-accent-foreground font-medium"
                            : ""
                        }`}
                        asChild
                      >
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-3"
                        >
                          <Heart className="h-5 w-5" />
                          Wishlist
                          {state.wishlist.length > 0 && (
                            <Badge
                              variant="destructive"
                              className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold min-w-[1.25rem] ml-auto"
                            >
                              {state.wishlist.length}
                            </Badge>
                          )}
                        </Link>
                      </Button>

                      <Button
                        variant={
                          pathname === "/profile" ? "secondary" : "ghost"
                        }
                        className={`w-full justify-start h-10 text-base transition-colors ${
                          pathname === "/profile"
                            ? "bg-accent text-accent-foreground font-medium"
                            : ""
                        }`}
                        asChild
                      >
                        <Link
                          href="/profile"
                          className="flex items-center gap-3"
                        >
                          <User className="h-5 w-5" />
                          Profile
                        </Link>
                      </Button>

                      <Button
                        variant={pathname === "/cart" ? "secondary" : "ghost"}
                        className={`w-full justify-start h-10 text-base transition-colors ${
                          pathname === "/cart"
                            ? "bg-accent text-accent-foreground font-medium"
                            : ""
                        }`}
                        asChild
                      >
                        <Link href="/cart" className="flex items-center gap-3">
                          <ShoppingCart className="h-5 w-5" />
                          Cart
                          {state.items.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold min-w-[1.25rem] ml-auto"
                            >
                              {state.items.reduce(
                                (sum: number, item: any) => sum + item.quantity,
                                0
                              )}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
