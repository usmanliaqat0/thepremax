"use client";

import { Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { Section, Container, SectionHeader } from "@/components/ui/layout";
import { ProductGridWrapper } from "@/components/ui/grid";

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  limit?: number;
  variant?: "default" | "compact" | "featured";
  className?: string;
  showHeader?: boolean;
}

const ProductGrid = ({
  products,
  title,
  subtitle,
  limit,
  variant = "default",
  className,
  showHeader = true,
}: ProductGridProps) => {
  const displayProducts = limit ? products.slice(0, limit) : products;

  if (products.length === 0) {
    return (
      <Section className={className}>
        <Container>
          {title && showHeader && (
            <SectionHeader title={title} subtitle={subtitle} />
          )}
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found.</p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className={className}>
      <Container>
        {title && showHeader && (
          <SectionHeader title={title} subtitle={subtitle} />
        )}

        <ProductGridWrapper
          variant={
            variant === "compact"
              ? "compact"
              : variant === "featured"
              ? "spacious"
              : "comfortable"
          }
        >
          {displayProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              variant={variant}
            />
          ))}
        </ProductGridWrapper>
      </Container>
    </Section>
  );
};

export default ProductGrid;
