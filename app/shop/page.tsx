"use client";

import { useState, useEffect, Suspense, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";

// Lazy load Footer for better performance
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-96 bg-muted animate-pulse" />,
});
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
import { Section, Container, SectionHeader } from "@/components/ui/layout";
import { ProductGridWrapper } from "@/components/ui/grid";
import { PageLoading, GridSkeleton } from "@/components/ui/loading";
import { products, Product } from "@/lib/products";
import {
  processProducts,
  getAvailableFilters,
  SortOption,
} from "@/lib/product-utils";
import { Search, Filter, X } from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useSearchParams } from "next/navigation";

const ShopContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = useSearchParams();

  // Scroll to top when navigating to shop page
  useScrollToTop();

  // Handle URL search parameter
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  const getPriceRangeValues = (range: string) => {
    switch (range) {
      case "under-10":
        return { min: 0, max: 10 };
      case "10-15":
        return { min: 10, max: 15 };
      case "over-15":
        return { min: 15, max: 999999 };
      default:
        return undefined;
    }
  };

  // Filter and sort products
  useEffect(() => {
    setIsLoading(true);

    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      const filters = {
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        priceRange:
          priceRange !== "all" ? getPriceRangeValues(priceRange) : undefined,
      };

      const processed = processProducts(products, searchTerm, filters, sortBy);

      setFilteredProducts(processed);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("name");
    setCategoryFilter("all");
    setPriceRange("all");
  };

  const activeFiltersCount = [
    searchTerm.trim() !== "",
    priceRange !== "all",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Header */}
      <Section variant="muted" size="lg">
        <Container>
          <SectionHeader
            title="Shop Collection"
            subtitle="Discover our complete range of premium fashion pieces designed to elevate your style."
          />
        </Container>
      </Section>

      {/* Filters and Search */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          {/* Search and Sort Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="health-beauty">Health & Beauty</SelectItem>
                  <SelectItem value="sports-recreation">
                    Sports & Recreation
                  </SelectItem>
                  <SelectItem value="tools-equipment">
                    Tools & Equipment
                  </SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-10">Under $10</SelectItem>
                  <SelectItem value="10-15">$10 - $15</SelectItem>
                  <SelectItem value="over-15">Over $15</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
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
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
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
              Showing {filteredProducts.length} of {products.length} products
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
      {isLoading ? (
        <Section>
          <Container>
            <GridSkeleton items={12} />
          </Container>
        </Section>
      ) : filteredProducts.length > 0 ? (
        <Section>
          <Container>
            <ProductGridWrapper>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGridWrapper>
          </Container>
        </Section>
      ) : (
        <Section>
          <Container>
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
                <Button onClick={clearFilters} variant="accent">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </Container>
        </Section>
      )}

      <Footer />
    </div>
  );
};

const Shop = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
};

export default Shop;
