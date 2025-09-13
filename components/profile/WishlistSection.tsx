"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Trash2,
  Search,
  Grid3X3,
  List,
  Filter,
  Star,
  Eye,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  inStock: boolean;
  discount?: number;
  dateAdded: string;
  size?: string;
  color?: string;
}

const WishlistSection = () => {
  const { toast } = useToast();

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("dateAdded");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleRemoveFromWishlist = (itemId: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== itemId));
    toast({
      title: "Item removed",
      description: "The item has been removed from your wishlist.",
    });
  };

  const handleAddToCart = (item: WishlistItem) => {
    if (!item.inStock) {
      toast({
        title: "Out of stock",
        description: "This item is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleShareItem = (item: WishlistItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out this ${item.name} on ThePremax!`,
        url: `${window.location.origin}/product/${item.id}`,
      });
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(
        `${window.location.origin}/product/${item.id}`
      );
      toast({
        title: "Link copied",
        description: "Product link has been copied to clipboard.",
      });
    }
  };

  const handleMoveToCart = (item: WishlistItem) => {
    if (!item.inStock) {
      toast({
        title: "Out of stock",
        description: "This item is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    handleAddToCart(item);
    handleRemoveFromWishlist(item.id);
    toast({
      title: "Moved to cart",
      description: `${item.name} has been moved from wishlist to cart.`,
    });
  };

  const filteredItems = wishlistItems
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

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= Math.floor(rating)
              ? "text-yellow-400 fill-current"
              : i <= rating
              ? "text-yellow-400 fill-current opacity-50"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredItems.map((item) => (
        <Card
          key={item.id}
          className="group hover:shadow-lg transition-all duration-300"
        >
          <div className="relative overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {item.discount && (
              <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                -{item.discount}%
              </Badge>
            )}
            {!item.inStock && (
              <Badge className="absolute top-2 right-2 bg-gray-500 text-white">
                Out of Stock
              </Badge>
            )}

            <div className="absolute top-2 right-2 flex space-x-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleShareItem(item)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {item.name}
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFromWishlist(item.id)}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>

              <p className="text-sm text-gray-600">{item.category}</p>

              {(item.size || item.color) && (
                <div className="flex space-x-2 text-sm text-gray-600">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>Color: {item.color}</span>}
                </div>
              )}

              <div className="flex items-center space-x-1">
                {renderStars(item.rating)}
                <span className="text-sm text-gray-600">
                  ({item.reviewCount})
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">
                  ${item.price.toFixed(2)}
                </span>
                {item.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ${item.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Added {new Date(item.dateAdded).toLocaleDateString()}
              </p>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button
                onClick={() => handleAddToCart(item)}
                disabled={!item.inStock}
                className="flex-1"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                onClick={() => handleMoveToCart(item)}
                disabled={!item.inStock}
                size="sm"
              >
                Move to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                {item.discount && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs">
                    -{item.discount}%
                  </Badge>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    {(item.size || item.color) && (
                      <div className="flex space-x-2 text-sm text-gray-600 mt-1">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {!item.inStock && (
                      <Badge className="bg-gray-500 text-white mt-1">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(item.rating)}
                      <span className="text-sm text-gray-600">
                        ({item.reviewCount})
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Added {new Date(item.dateAdded).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShareItem(item)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.inStock}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveFromWishlist(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                {wishlistItems.length} item
                {wishlistItems.length !== 1 ? "s" : ""} saved for later
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
          {/* Search and Filters */}
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

          {/* Wishlist Items */}
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
                <Button>
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
