"use client";

import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

const Wishlist = () => {
  const { state, clearWishlist } = useCart();

  // Scroll to top when navigating to wishlist page
  useScrollToTop();

  if (state.wishlist.length === 0) {
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

      {/* Header */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">
                My Wishlist
              </h1>
              <p className="text-muted-foreground">
                {state.wishlist.length} items saved for later
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/shop">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
              {state.wishlist.length > 0 && (
                <Button variant="destructive" onClick={clearWishlist}>
                  Clear Wishlist
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Wishlist Items */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {state.wishlist.map((item) => (
              <div key={item.id}>
                <ProductCard product={item.product} />
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
