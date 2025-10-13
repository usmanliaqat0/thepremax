"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, Container, SectionHeader } from "@/components/ui/layout";
import { IconFeature, FeatureGrid } from "@/components/ui/features";
import { ProductGridWrapper } from "@/components/ui/grid";
import { GridSkeleton } from "@/components/ui/loading";
import { Product, Category } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Truck,
  Shield,
  Headphones,
  CreditCard,
} from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

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
  useScrollToTop();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch featured products
        const featuredResponse = await fetch(
          "/api/products?featured=true&limit=8"
        );
        const featuredData = await featuredResponse.json();

        // Fetch top rated products
        const topRatedResponse = await fetch(
          "/api/products?sortBy=rating&sortOrder=desc&limit=8"
        );
        const topRatedData = await topRatedResponse.json();

        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        const categoriesData = await categoriesResponse.json();

        if (featuredData.success) {
          setFeaturedProducts(featuredData.data);
        }

        if (topRatedData.success) {
          setTopRatedProducts(topRatedData.data);
        }

        if (categoriesData.success) {
          setCategories(categoriesData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Quick delivery from trusted suppliers across USA",
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

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://thepremax.com/#organization",
        name: "ThePreMax",
        url: "https://thepremax.com",
        logo: {
          "@type": "ImageObject",
          url: "https://thepremax.com/logo.png",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+1 512-355-5110",
          contactType: "customer service",
          email: "info@thepremax.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "5900 BALCONES DR 23935",
            addressLocality: "AUSTIN",
            addressRegion: "TX",
            postalCode: "78731",
            addressCountry: "US",
          },
        },
        sameAs: [
          "https://www.facebook.com/thepremax",
          "https://www.instagram.com/thepremax",
          "https://www.twitter.com/thepremax",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://thepremax.com/#website",
        url: "https://thepremax.com",
        name: "ThePreMax",
        description:
          "Everything You Need, All in One Place - Health, Beauty, Sports, Tools & More",
        publisher: {
          "@id": "https://thepremax.com/#organization",
        },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate:
                "https://thepremax.com/shop?search={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://thepremax.com/#webpage",
        url: "https://thepremax.com",
        name: "ThePreMax - Everything You Need, All in One Place",
        isPartOf: {
          "@id": "https://thepremax.com/#website",
        },
        about: {
          "@id": "https://thepremax.com/#organization",
        },
        description:
          "Discover premium products across Health & Beauty, Sports & Recreation, Tools & Equipment, and Automotive. Quality products from trusted suppliers with fast USA shipping.",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <Navigation />
      <HeroSection />

      <Section>
        <Container>
          <SectionHeader
            title="Shop by Category"
            subtitle="Explore our diverse range of products across multiple categories"
          />
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-40 sm:h-48 mb-4"></div>
                  <div className="h-5 sm:h-6 bg-muted rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                {error}
              </p>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                className="sm:size-default"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {categories.slice(0, 4).map((category) => (
                <Card
                  key={category._id}
                  className="group cursor-pointer border-0 shadow-fashion-sm hover:shadow-fashion-product transition-fashion h-full overflow-hidden bg-card transform hover:-translate-y-1 p-0 gap-0"
                >
                  <Link
                    href={`/category/${category.slug}`}
                    className="h-full flex flex-col"
                  >
                    {/* Image Section */}
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/40 flex items-center justify-center">
                          <div className="text-4xl sm:text-6xl opacity-60">
                            📦
                          </div>
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                      {/* Hover Effect */}
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 group-hover:text-accent transition-colors duration-300 text-center">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground text-xs sm:text-sm text-center leading-relaxed">
                        {category.description ||
                          "Explore our amazing collection"}
                      </p>

                      {/* Bottom Action */}
                      <div className="mt-3 sm:mt-4 flex justify-center">
                        <div className="inline-flex items-center text-accent text-xs sm:text-sm font-medium opacity-100 transition-all duration-300">
                          Shop Now
                          <ArrowRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section variant="muted">
        <Container>
          <SectionHeader
            title="Top Rated Products"
            subtitle="Highly rated items across all categories with excellent customer reviews"
          />
          {isLoading ? (
            <GridSkeleton items={4} />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <ProductGridWrapper>
              {topRatedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </ProductGridWrapper>
          )}
        </Container>
      </Section>

      <Section variant="muted">
        <Container>
          <SectionHeader
            title="Featured Products"
            subtitle="Discover amazing deals across all categories - from health & beauty to automotive parts."
          />

          {isLoading ? (
            <GridSkeleton items={4} />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <ProductGridWrapper className="mb-12">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </ProductGridWrapper>

              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  variant="luxury"
                  className="w-full sm:w-auto"
                >
                  <Link href="/shop">
                    Shop All Categories
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </Container>
      </Section>

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

      <Newsletter variant="accent" />

      <Footer />
    </div>
  );
}
