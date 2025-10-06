"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  Heart,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart, CartItem } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Category } from "@/lib/types";

const Navigation = () => {
  const { getCartItemsCount, state } = useCart();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

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
      <div className="bg-accent text-accent-foreground text-center py-2 px-4 text-sm font-medium">
        Shop All Categories | Health, Sports, Tools & More | Fast USA Shipping!
      </div>

      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="ThePreMax"
              width={50}
              height={50}
              className="rounded"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <Button variant="nav" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="nav" asChild>
              <Link href="/shop">Shop</Link>
            </Button>

            <div className="relative group">
              <Button variant="nav" className="group">
                Categories
                <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
              </Button>

              <div className="absolute top-full left-0 mt-1 w-56 bg-background border border-border rounded-md shadow-fashion-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      href={`/category/${category.slug}`}
                      className="flex items-center px-4 py-4 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-fashion hover:scale-[1.02] group"
                    >
                      <div className="mr-3 w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden shadow-fashion-sm">
                        {category.image ? (
                          <Image
                            src={category.image}
                            alt={category.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
                            <span className="text-lg">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{category.name}</div>
                        <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Explore products
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0" />
                    </Link>
                  ))}
                  <div className="border-t border-border mt-2 pt-2">
                    <Link
                      href="/shop"
                      className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors font-medium rounded-sm mx-1"
                    >
                      <span>View All Products</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Button variant="nav" asChild>
              <Link href="/about">About</Link>
            </Button>
            <Button variant="nav" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
            {isAdmin() && (
              <Button variant="nav" asChild>
                <Link href="/admin" className="text-accent font-semibold">
                  Admin
                </Link>
              </Button>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search across all categories..."
                className="pl-10 bg-muted border-0 focus:bg-background"
                onKeyPress={handleSearch}
              />
            </div>
          </div>

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
              <Link href={isAdmin() ? "/admin" : "/profile"}>
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

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 p-6 border-b">
                    <Image
                      src="/logo.png"
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
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="search"
                        placeholder="Search across all categories..."
                        className="pl-10"
                        onKeyPress={handleSearch}
                      />
                    </div>

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
                      <Button
                        variant={
                          pathname === "/track-order" ? "secondary" : "ghost"
                        }
                        className={`w-full justify-start h-10 text-base transition-colors ${
                          pathname === "/track-order"
                            ? "bg-accent text-accent-foreground font-medium"
                            : ""
                        }`}
                        asChild
                      >
                        <Link href="/track-order">Track Order</Link>
                      </Button>
                      {isAdmin() && (
                        <Button
                          variant={
                            pathname === "/admin" ? "secondary" : "ghost"
                          }
                          className={`w-full justify-start h-10 text-base transition-colors ${
                            pathname === "/admin"
                              ? "bg-accent text-accent-foreground font-medium"
                              : ""
                          }`}
                          asChild
                        >
                          <Link
                            href="/admin"
                            className="text-accent font-semibold"
                          >
                            Admin Panel
                          </Link>
                        </Button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Categories
                      </h3>
                      {categories.map((category) => (
                        <Button
                          key={category._id}
                          variant={
                            pathname === `/category/${category.slug}`
                              ? "secondary"
                              : "ghost"
                          }
                          className={`w-full justify-start h-12 text-base pl-4 transition-fashion hover:bg-accent/10 hover:scale-[1.02] ${
                            pathname === `/category/${category.slug}`
                              ? "bg-accent text-accent-foreground font-medium shadow-fashion-sm"
                              : "hover:shadow-fashion-sm"
                          }`}
                          asChild
                        >
                          <Link
                            href={`/category/${category.slug}`}
                            className="flex items-center"
                          >
                            <div className="mr-3 w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden shadow-fashion-sm">
                              {category.image ? (
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
                                  <span className="text-lg">📦</span>
                                </div>
                              )}
                            </div>
                            <span className="font-medium">{category.name}</span>
                          </Link>
                        </Button>
                      ))}
                    </div>

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
                          pathname === "/profile" ||
                          (isAdmin() && pathname === "/admin")
                            ? "secondary"
                            : "ghost"
                        }
                        className={`w-full justify-start h-10 text-base transition-colors ${
                          pathname === "/profile" ||
                          (isAdmin() && pathname === "/admin")
                            ? "bg-accent text-accent-foreground font-medium"
                            : ""
                        }`}
                        asChild
                      >
                        <Link
                          href={isAdmin() ? "/admin" : "/profile"}
                          className="flex items-center gap-3"
                        >
                          <User className="h-5 w-5" />
                          {isAdmin() ? "Admin Panel" : "Profile"}
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
                                (sum: number, item: CartItem) =>
                                  sum + item.quantity,
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
