"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";

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
import { GridSkeleton } from "@/components/ui/loading";
import { BeautifulLoader } from "@/components/ui/loader";
import { Product, Category } from "@/lib/types";
import { SortOption } from "@/lib/product-utils";
import { Search, X } from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useSearchParams } from "next/navigation";

const ShopContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();

  useScrollToTop();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const productsResponse = await fetch("/api/products?limit=100");
        const productsData = await productsResponse.json();

        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();

        if (productsData.success) {
          setProducts(productsData.data);
          setFilteredProducts(productsData.data);
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
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  const getPriceRangeValues = (range: string) => {
    switch (range) {
      case "under-50":
        return { min: 0, max: 50 };
      case "50-200":
        return { min: 50, max: 200 };
      case "200-500":
        return { min: 200, max: 500 };
      case "over-500":
        return { min: 500, max: 999999 };
      default:
        return undefined;
    }
  };

  useEffect(() => {
    if (products.length === 0) return;

    setIsLoading(true);

    const timer = setTimeout(() => {
      let filtered = [...products];

      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            (product.tags &&
              Array.isArray(product.tags) &&
              product.tags.some((tag) =>
                tag.toLowerCase().includes(searchLower)
              ))
        );
      }

      if (categoryFilter !== "all") {
        const selectedCategory = categories.find(
          (cat) => cat.slug === categoryFilter
        );
        if (selectedCategory) {
          filtered = filtered.filter((product) => {
            return product.categoryId === selectedCategory._id;
          });
        }
      }

      if (priceRange !== "all") {
        const range = getPriceRangeValues(priceRange);
        if (range) {
          const { min, max } = range;
          filtered = filtered.filter(
            (product) => product.basePrice >= min && product.basePrice <= max
          );
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
          case "popular":
            return (b.rating || 0) - (a.rating || 0);
          default:
            return (
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
            );
        }
      });

      setFilteredProducts(filtered);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [products, searchTerm, categoryFilter, priceRange, sortBy, categories]);

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

      {}
      <Section variant="muted" size="lg">
        <Container>
          <SectionHeader
            title="Shop Collection"
            subtitle="Discover our complete range of premium fashion pieces designed to elevate your style."
          />
        </Container>
      </Section>

      {}
      <section className="py-6 sm:py-8 border-b border-border">
        <div className="container mx-auto px-4">
          {}
          <div className="flex flex-col gap-4 sm:gap-6 items-start mb-6">
            {}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {}
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 w-full">
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 flex-1">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full lg:w-auto lg:min-w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-full lg:w-auto lg:min-w-[160px]">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-50">Under $50</SelectItem>
                    <SelectItem value="50-200">$50 - $200</SelectItem>
                    <SelectItem value="200-500">$200 - $500</SelectItem>
                    <SelectItem value="over-500">Over $500</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortOption)}
                >
                  <SelectTrigger className="w-full lg:w-auto lg:min-w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-destructive hover:text-destructive w-full lg:w-auto"
                >
                  <X className="h-4 w-4" />
                  Clear Filters ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          {}
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

      {}
      <section className="py-4 sm:py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <p className="text-sm sm:text-base text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            {filteredProducts.length === 0 && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      </section>

      {}
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
                <ProductCard key={product._id} product={product} />
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <BeautifulLoader size="lg" variant="default" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
};

export default Shop;
