"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Heart,
  ShoppingCart,
  Search,
  Grid3X3,
  List,
  Filter,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";

const WishlistSection = () => {
  const { state } = useAuth();
  const router = useRouter();
  const { state: wishlistState, refreshWishlist } = useWishlist();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("dateAdded");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Refresh wishlist when component mounts
  useEffect(() => {
    if (state.isAuthenticated) {
      refreshWishlist();
    }
  }, [state.isAuthenticated, refreshWishlist]);

  const filteredItems = wishlistState.items
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      switch (filterBy) {
        case "inStock":
          matchesFilter = item.inStock;
          break;
        case "outOfStock":
          matchesFilter = !item.inStock;
          break;
        case "onSale":
          matchesFilter = !!item.discount;
          break;
        case "all":
        default:
          matchesFilter = true;
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "dateAdded":
        default:
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
      }
    });

  const GridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {filteredItems.map((item) => (
        <ProductCard
          key={item.productId}
          product={{
            _id: item.productId,
            name: item.name,
            slug: item.name.toLowerCase().replace(/\s+/g, "-"),
            description: item.name,
            basePrice: item.price,
            compareAtPrice: item.originalPrice || 0,
            categoryId: item.category.toLowerCase().replace(/\s+/g, "-"),
            category: {
              _id: item.category.toLowerCase().replace(/\s+/g, "-"),
              name: item.category,
              slug: item.category.toLowerCase().replace(/\s+/g, "-"),
            },
            tags: [],
            images: [
              {
                id: item.productId + "-main",
                url: item.image,
                alt: item.name,
                isPrimary: true,
                order: 1,
              },
            ],
            totalSold: 0,
            topRated: false,
            onSale: false,
            status: "active",
            rating: item.rating,
            reviewCount: item.reviewCount,
            specifications: [],
            sizes: item.size ? [item.size] : [],
            colors: item.color ? [item.color] : [],
            inStock: item.inStock,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
        />
      ))}
    </div>
  );

  const ListView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {filteredItems.map((item) => (
        <ProductCard
          key={item.productId}
          product={{
            _id: item.productId,
            name: item.name,
            slug: item.name.toLowerCase().replace(/\s+/g, "-"),
            description: item.name,
            basePrice: item.price,
            compareAtPrice: item.originalPrice || 0,
            categoryId: item.category.toLowerCase().replace(/\s+/g, "-"),
            category: {
              _id: item.category.toLowerCase().replace(/\s+/g, "-"),
              name: item.category,
              slug: item.category.toLowerCase().replace(/\s+/g, "-"),
            },
            tags: [],
            images: [
              {
                id: item.productId + "-main",
                url: item.image,
                alt: item.name,
                isPrimary: true,
                order: 1,
              },
            ],
            totalSold: 0,
            topRated: false,
            onSale: false,
            status: "active",
            rating: item.rating,
            reviewCount: item.reviewCount,
            specifications: [],
            sizes: item.size ? [item.size] : [],
            colors: item.color ? [item.color] : [],
            inStock: item.inStock,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>My Wishlist</span>
              </CardTitle>
              <CardDescription>
                {wishlistState.items.length} item
                {wishlistState.items.length !== 1 ? "s" : ""} saved for later
              </CardDescription>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">Recently Added</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="inStock">In Stock</SelectItem>
                <SelectItem value="outOfStock">Out of Stock</SelectItem>
                <SelectItem value="onSale">On Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterBy !== "all"
                  ? "No items found"
                  : "Your wishlist is empty"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterBy !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Save items you love to your wishlist to keep track of them"}
              </p>
              {!searchTerm && filterBy === "all" && (
                <Button onClick={() => router.push("/shop")}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              )}
            </div>
          ) : (
            <>{viewMode === "grid" ? <GridView /> : <ListView />}</>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistSection;
