"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] bg-gradient-hero overflow-hidden">
      <div className="container mx-auto p-4 md:px-4 md:py-0 h-full">
        <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[600px] lg:min-h-[700px]">
          {/* Text Content */}
          <div className="space-y-8 lg:space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary leading-tight">
                Everything You Need,{" "}
                <span className="text-accent">All in One Place</span>.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                From health & beauty to tools & automotive - ThePreMax brings
                you quality products across every category at unbeatable prices.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="luxury" className="group">
                <Link href="/shop">
                  Shop All Categories
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/category/health-beauty">Browse Categories</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="pt-8 border-t border-border">
              <div className="flex flex-wrap gap-8 justify-between">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    19+
                  </div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    4+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Categories
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    98%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Happy Customers
                  </div>
                </div>
                <div className="text-center hidden md:block">
                  <div className="text-2xl md:text-3xl font-bold text-primary">
                    98%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Satisfaction Rate
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/assets/hero-shirts.jpg"
                alt="Fashion Collection"
                width={600}
                height={600}
                className="w-full h-auto object-cover rounded-2xl shadow-fashion-luxury"
                priority
              />
            </div>

            {/* Background decorative elements */}
            <div className="absolute top-4 right-4 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
