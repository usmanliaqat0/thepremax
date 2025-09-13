"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Section, Container, SectionHeader } from "@/components/ui/layout";
import { IconFeature, FeatureGrid } from "@/components/ui/features";
import { ProductGridWrapper } from "@/components/ui/grid";
import { getFeaturedProducts, getTopRatedProducts } from "@/lib/products";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  Shield,
  Headphones,
  CreditCard,
} from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

// Dynamic imports for below-the-fold components
const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-96 bg-muted animate-pulse" />,
});

const Newsletter = dynamic(
  () =>
    import("@/components/ui/newsletter").then((mod) => ({
      default: mod.Newsletter,
    })),
  {
    loading: () => <div className="h-32 bg-muted animate-pulse" />,
  }
);

export default function Home() {
  // Scroll to top when navigating to home page
  useScrollToTop();

  // Memoize product arrays to prevent unnecessary re-filtering
  const featuredProducts = useMemo(() => getFeaturedProducts(), []);
  const topRatedProducts = useMemo(() => getTopRatedProducts(), []);

  const heroStats = [
    { value: "500+", label: "Products" },
    { value: "10k+", label: "Happy Customers" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Free delivery on orders over $50",
    },
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "Premium materials and craftsmanship",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Always here to help you",
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "Safe and secure transactions",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />

      {/* Top Rated Products */}
      <Section>
        <Container>
          <SectionHeader
            title="Top Rated"
            subtitle="Customer favorites and bestselling items"
          />
          <ProductGridWrapper>
            {topRatedProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGridWrapper>
        </Container>
      </Section>

      {/* Featured Products */}
      <Section variant="muted">
        <Container>
          <SectionHeader
            title="Featured Collection"
            subtitle="Discover our handpicked selection of premium fashion pieces designed to elevate your wardrobe."
          />

          <ProductGridWrapper className="mb-12">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGridWrapper>

          <div className="text-center">
            <Button asChild size="lg" variant="luxury">
              <Link href="/shop">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section>
        <Container>
          <FeatureGrid>
            {features.map((feature, index) => (
              <IconFeature
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                variant="accent"
              />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      {/* Newsletter Section */}
      <Newsletter variant="accent" />

      {/* Footer */}
      <Footer />
    </div>
  );
}
