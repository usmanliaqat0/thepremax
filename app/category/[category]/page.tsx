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
// Removed dummy data imports - now using real API data
import { Search, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { Product, Category } from "@/lib/types";

const CategoryPage = () => {
  const params = useParams();
  const categorySlug = params.category as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const category = categories.find((cat) => cat.slug === categorySlug);

  useScrollToTop();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch products
        const productsResponse = await fetch("/api/products?limit=1000");
        const productsData = await productsResponse.json();

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();

        if (productsData.success) {
          setProducts(productsData.data);
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!category) return;

    let filtered = products.filter(
      (product) => product.categoryId === category._id
    );

    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercaseSearch) ||
          product.description.toLowerCase().includes(lowercaseSearch)
      );
    }

    if (priceRange !== "all") {
      switch (priceRange) {
        case "under-15":
          filtered = filtered.filter((product) => product.basePrice < 15);
          break;
        case "15-30":
          filtered = filtered.filter(
            (product) => product.basePrice >= 15 && product.basePrice <= 30
          );
          break;
        case "30-50":
          filtered = filtered.filter(
            (product) => product.basePrice >= 30 && product.basePrice <= 50
          );
          break;
        case "over-50":
          filtered = filtered.filter((product) => product.basePrice > 50);
          break;
      }
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.basePrice - b.basePrice;
        case "price-high":
          return b.basePrice - a.basePrice;
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.rating - a.rating;
        case "featured":
          return b.featured ? 1 : -1;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [category, products, searchTerm, sortBy, priceRange]);

  const clearFilters = () => {
    setSearchTerm("");
    setSortBy("name");
    setPriceRange("all");
  };

  const activeFiltersCount = [
    searchTerm.trim() !== "",
    priceRange !== "all",
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading category...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                The category you&apos;re looking for doesn&apos;t exist.
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
              <div className="flex items-center gap-6 mb-4">
                <div className="w-20 h-20 flex items-center justify-center rounded-lg overflow-hidden shadow-fashion-sm">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">
                    {category.name}
                  </h1>
                  <div className="w-16 h-1 bg-gradient-to-r from-accent to-accent/60 rounded-full"></div>
                </div>
              </div>
              <p className="text-muted-foreground mb-2">
                {category.description}
              </p>
              <p className="text-sm text-muted-foreground">
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
                  <SelectItem value="under-15">Under $15</SelectItem>
                  <SelectItem value="15-30">$15 - $30</SelectItem>
                  <SelectItem value="30-50">$30 - $50</SelectItem>
                  <SelectItem value="over-50">Over $50</SelectItem>
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
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="brand">Brand A-Z</SelectItem>
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
                  Search: &quot;{searchTerm}&quot;
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
              Showing {filteredProducts.length} of {category.productCount || 0}{" "}
              products
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
                <div key={product._id}>
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
