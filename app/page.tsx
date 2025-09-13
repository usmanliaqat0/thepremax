"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    { value: "19+", label: "Products" },
    { value: "4+", label: "Categories" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  const features = [
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Quick delivery from trusted suppliers worldwide",
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "All products sourced from reputable sellers",
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Help with orders and product questions",
    },
    {
      icon: CreditCard,
      title: "Secure Checkout",
      description: "Safe and secure payment processing",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />

      {/* Categories Showcase */}
      <Section>
        <Container>
          <SectionHeader
            title="Shop by Category"
            subtitle="Explore our diverse range of products across multiple categories"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                name: "Health & Beauty",
                icon: "💄",
                href: "/category/health-beauty",
                description: "Skincare & Supplements",
              },
              {
                name: "Sports & Recreation",
                icon: "🏀",
                href: "/category/sports-recreation",
                description: "Sports Equipment",
              },
              {
                name: "Tools & Equipment",
                icon: "🔧",
                href: "/category/tools-equipment",
                description: "Professional Tools",
              },
              {
                name: "Automotive",
                icon: "🚗",
                href: "/category/automotive",
                description: "Auto Parts & Accessories",
              },
            ].map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="group cursor-pointer border-2 hover:border-accent transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center h-full flex flex-col items-center justify-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Top Rated Products */}
      <Section variant="muted">
        <Container>
          <SectionHeader
            title="Top Rated Products"
            subtitle="Highly rated items across all categories with excellent customer reviews"
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
            title="Featured Products"
            subtitle="Discover amazing deals across all categories - from health & beauty to automotive parts."
          />

          <ProductGridWrapper className="mb-12">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGridWrapper>

          <div className="text-center">
            <Button asChild size="lg" variant="luxury">
              <Link href="/shop">
                Shop All Categories
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
