"use client";

import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useEffect } from "react";

const Wishlist = () => {
  const {
    state: wishlistState,
    clearWishlist,
    refreshWishlist,
  } = useWishlist();
  const { state: authState } = useAuth();

  useScrollToTop();

  // Fetch wishlist from database when component mounts
  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshWishlist();
    }
  }, [authState.isAuthenticated, refreshWishlist]);

  // Show loading state while fetching
  if (wishlistState.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-muted-foreground animate-pulse" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-2">
                Loading your wishlist...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we fetch your saved items.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (wishlistState.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Save items you love for later by clicking the heart icon.
              </p>
              <Link href="/shop">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
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

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">
                My Wishlist
              </h1>
              <p className="text-muted-foreground">
                {wishlistState.items.length} items saved for later
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link href="/shop" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
              {wishlistState.items.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={clearWishlist}
                  className="w-full sm:w-auto"
                >
                  Clear Wishlist
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wishlistState.items.map((item) => (
              <div key={item.productId}>
                <ProductCard
                  product={{
                    _id: item.productId,
                    name: item.name,
                    slug: item.name.toLowerCase().replace(/\s+/g, "-"),
                    description: item.name,
                    basePrice: item.price,
                    compareAtPrice: item.originalPrice,
                    categoryId: item.category
                      .toLowerCase()
                      .replace(/\s+/g, "-"),
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
                    featured: false,
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
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Wishlist;
