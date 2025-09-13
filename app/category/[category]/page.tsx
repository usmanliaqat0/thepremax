"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { products, Product, categories } from "@/lib/products";
import { Search, Filter, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

const CategoryPage = () => {
  const params = useParams();
  const categoryId = params.category as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const category = categories.find((cat) => cat.id === categoryId);

  // Scroll to top when navigating to category page
  useScrollToTop();

  // Filter and sort products
  useEffect(() => {
    let filtered = products.filter(
      (product) => product.category === categoryId
    );

    // Search filter
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercaseSearch) ||
          product.description.toLowerCase().includes(lowercaseSearch)
      );
    }

    // Price range filter
    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-5000":
          filtered = filtered.filter((product) => product.price < 18);
          break;
        case "5000-8000":
          filtered = filtered.filter(
            (product) => product.price >= 18 && product.price <= 28
          );
          break;
        case "over-8000":
          filtered = filtered.filter((product) => product.price > 28);
          break;
      }
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        case "featured":
          return b.featured ? 1 : -1;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [categoryId, searchTerm, sortBy, priceRange]);

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("name");
    setPriceRange("all");
  };

  const activeFiltersCount = [
    searchTerm.trim() !== "",
    priceRange !== "all",
  ].filter(Boolean).length;

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <h2 className="text-2xl font-heading font-bold mb-4">
                Category not found
              </h2>
              <p className="text-muted-foreground mb-6">
                The category you're looking for doesn't exist.
              </p>
              <Link href="/shop">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Shop
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
                <span>/</span>
                <Link href="/shop" className="hover:text-primary">
                  Shop
                </Link>
                <span>/</span>
                <span className="text-primary">{category.name}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">
                {category.name}
              </h1>
              <p className="text-muted-foreground">
                {filteredProducts.length} products available
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder={`Search in ${category.name}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-5000">Under $18</SelectItem>
                  <SelectItem value="5000-8000">$18 - $28</SelectItem>
                  <SelectItem value="over-8000">Over $28</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="featured">Featured First</SelectItem>
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm.trim() && (
                <Badge variant="secondary">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary">
                  Price: {priceRange}
                  <button
                    onClick={() => setPriceRange("all")}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Results Count */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} of {category.count} products
            </p>
            {filteredProducts.length === 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <section className="pb-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or clear all filters.
                </p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default CategoryPage;
