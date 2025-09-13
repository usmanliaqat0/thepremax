"use client";

import React from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/products";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import { getColorValue } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

const ProductCard = ({
  product,
  variant = "default",
  className,
}: ProductCardProps) => {
  const { addToCart, addToWishlist, isInWishlist } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes[0];
    const defaultColor = product.colors[0];
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      // Remove from wishlist logic would go here
    } else {
      addToWishlist(product);
    }
  };

  const variants = {
    default: {
      card: "group overflow-hidden border-0 shadow-fashion-sm hover:shadow-fashion-product transition-fashion bg-card",
      content: "p-3 space-y-2",
      image: "aspect-square",
      title:
        "font-semibold text-base line-clamp-1 group-hover:text-accent transition-colors",
      price: "text-lg font-bold text-primary",
    },
    compact: {
      card: "group overflow-hidden border-0 shadow-fashion-sm hover:shadow-fashion-md transition-fashion bg-card",
      content: "p-2 space-y-1.5",
      image: "aspect-square",
      title:
        "font-medium text-sm line-clamp-1 group-hover:text-accent transition-colors",
      price: "text-base font-bold text-primary",
    },
    featured: {
      card: "group overflow-hidden border-0 shadow-fashion-product hover:shadow-fashion-luxury transition-fashion-luxury bg-card",
      content: "p-4 space-y-3",
      image: "aspect-[4/5]",
      title:
        "font-heading font-bold text-lg line-clamp-2 group-hover:text-accent transition-colors",
      price: "text-xl font-bold text-primary",
    },
  };

  const variantStyles = variants[variant];

  return (
    <Card className={cn(variantStyles.card, "p-0 gap-0", className)}>
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          {/* Product Image */}
          <div className={cn(variantStyles.image, "overflow-hidden bg-muted")}>
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={400}
              priority={variant === "featured"}
              loading={variant === "featured" ? "eager" : "lazy"}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.sale && (
              <Badge
                variant="destructive"
                className="text-xs font-medium shadow-fashion-sm"
              >
                SALE
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-accent text-accent-foreground text-xs font-medium shadow-fashion-sm">
                FEATURED
              </Badge>
            )}
            {product.topRated && (
              <Badge
                variant="secondary"
                className="text-xs font-medium shadow-fashion-sm"
              >
                ⭐ TOP RATED
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size={variant === "compact" ? "icon-sm" : "icon"}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/90 backdrop-blur-sm hover:bg-background shadow-fashion-sm"
            onClick={handleToggleWishlist}
          >
            <Heart
              className={cn(
                variant === "compact" ? "h-3.5 w-3.5" : "h-4 w-4",
                isInWishlist(product.id)
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              )}
            />
          </Button>

          {/* Quick Add to Cart */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              size={variant === "compact" ? "sm" : "default"}
              className="w-full bg-background/90 backdrop-blur-sm shadow-fashion-sm"
            >
              <ShoppingCart
                className={cn(
                  "mr-2",
                  variant === "compact" ? "h-3.5 w-3.5" : "h-4 w-4"
                )}
              />
              Quick Add
            </Button>
          </div>
        </div>

        <CardContent className={variantStyles.content}>
          {/* Product Name */}
          <h3 className={variantStyles.title}>{product.name}</h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className={variantStyles.price}>
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span
                className={cn(
                  "text-muted-foreground line-through",
                  variant === "featured" ? "text-base" : "text-sm"
                )}
              >
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Colors */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-muted-foreground",
                variant === "featured" ? "text-base" : "text-sm"
              )}
            >
              Colors:
            </span>
            <div className="flex gap-1">
              {product.colors
                .slice(0, variant === "compact" ? 3 : 4)
                .map((color, index) => (
                  <div
                    key={index}
                    className={cn(
                      "rounded-full border border-border ring-1 ring-transparent hover:ring-accent transition-all cursor-pointer",
                      variant === "featured" ? "w-5 h-5" : "w-4 h-4"
                    )}
                    style={{ backgroundColor: getColorValue(color) }}
                    title={color}
                  />
                ))}
              {product.colors.length > (variant === "compact" ? 3 : 4) && (
                <span className="text-xs text-muted-foreground">
                  +{product.colors.length - (variant === "compact" ? 3 : 4)}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <Badge
              variant={product.inStock ? "secondary" : "destructive"}
              className={variant === "featured" ? "text-sm" : "text-xs"}
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
            <span
              className={cn(
                "text-muted-foreground capitalize",
                variant === "featured" ? "text-sm" : "text-xs"
              )}
            >
              {product.category}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default React.memo(ProductCard);
