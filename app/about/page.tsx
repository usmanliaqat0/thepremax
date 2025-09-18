"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Star, Heart, Target, Zap, ArrowRight } from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

const About = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6">
              About <span className="text-accent">ThePreMax</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're passionate about bringing you premium fashion pieces that
              speak volumes about your unique style. Every design tells a story,
              and we're here to help you tell yours.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  ThePreMax was born from a simple belief: everyone deserves to
                  express their personality through high-quality, stylish
                  clothing that doesn't compromise on comfort or craftsmanship.
                </p>
                <p>
                  Started in 2020, we've grown from a small passion project to a
                  trusted brand serving thousands of fashion enthusiasts across
                  Pakistan. Our journey began with a mission to bridge the gap
                  between premium quality and accessible pricing.
                </p>
                <p>
                  Every piece in our collection is carefully curated and tested
                  to ensure it meets our high standards for quality, comfort,
                  and style. We believe that great fashion should be inclusive
                  and attainable for everyone.
                </p>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/logo.png"
                alt="ThePreMax Logo"
                width={400}
                height={400}
                className="w-full h-auto rounded-2xl shadow-fashion-luxury mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do at ThePreMax.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-fashion-product">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-4">
                  Quality First
                </h3>
                <p className="text-muted-foreground">
                  We never compromise on quality. Every product undergoes
                  rigorous testing to ensure it meets our premium standards.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-fashion-product">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-4">
                  Customer Love
                </h3>
                <p className="text-muted-foreground">
                  Our customers are at the heart of everything we do. Your
                  satisfaction and happiness drive our innovation.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-fashion-product">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-4">
                  Innovation
                </h3>
                <p className="text-muted-foreground">
                  We constantly evolve and adapt, bringing fresh designs and
                  modern styles to keep you ahead of trends.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-4">
              ThePreMax by Numbers
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                10k+
              </div>
              <div className="text-muted-foreground font-medium">
                Happy Customers
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                500+
              </div>
              <div className="text-muted-foreground font-medium">Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                98%
              </div>
              <div className="text-muted-foreground font-medium">
                Satisfaction Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                4.8
              </div>
              <div className="text-muted-foreground font-medium">
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-gradient-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Target className="h-16 w-16 text-accent-foreground mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-accent-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-accent-foreground/90 leading-relaxed mb-8">
              To make premium fashion accessible to everyone while maintaining
              the highest standards of quality, comfort, and style. We believe
              fashion is a form of self-expression, and everyone deserves to
              look and feel their best.
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link href="/shop">
                Shop Our Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
