"use client";

import React from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/currency";

import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact";
  className?: string;
}

const ProductCard = ({
  product,
  variant = "default",
  className,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes[0];
    const defaultColor = product.colors[0];
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      const defaultSize = product.sizes?.[0];
      const defaultColor = product.colors?.[0];
      await addToWishlist(product, defaultSize, defaultColor);
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
  };

  const variantStyles = variants[variant];

  return (
    <Card className={cn(variantStyles.card, "p-0 gap-0", className)}>
      <Link href={`/product/${product._id}`}>
        <div className="relative overflow-hidden">
          <div className={cn(variantStyles.image, "overflow-hidden bg-muted")}>
            <Image
              src={product.images?.[0]?.url || "/placeholder.jpg"}
              alt={product.name}
              width={400}
              height={400}
              priority={false}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.onSale && (
              <Badge
                variant="destructive"
                className="text-xs font-medium shadow-fashion-sm"
              >
                SALE
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

          <Button
            variant="ghost"
            size={variant === "compact" ? "icon-sm" : "icon"}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/90 backdrop-blur-sm hover:bg-background shadow-fashion-sm"
            onClick={handleToggleWishlist}
          >
            <Heart
              className={cn(
                variant === "compact" ? "h-3.5 w-3.5" : "h-4 w-4",
                isInWishlist(product._id)
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              )}
            />
          </Button>

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
          <div className="flex items-center justify-end">
            <Badge
              variant="outline"
              className={cn(
                "text-xs capitalize",
                variant === "compact" && "text-xs px-1.5 py-0.5"
              )}
            >
              {product.category?.name || "Uncategorized"}
            </Badge>
          </div>

          <h3 className={variantStyles.title}>{product.name}</h3>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className={cn("ml-1 font-medium", "text-xs")}>
                {product.rating}
              </span>
            </div>
            <span className={cn("text-muted-foreground", "text-xs")}>
              ({product.reviewCount})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={variantStyles.price}>
              {formatPrice(product.basePrice)}
            </span>
            {product.compareAtPrice && (
              <span
                className={cn("text-muted-foreground line-through", "text-sm")}
              >
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className={cn("text-green-600 font-medium", "text-xs")}>
              {product.inStock ? "✓ In Stock" : "Out of Stock"}
            </span>
            <span className={cn("text-muted-foreground", "text-xs")}>
              Fast Shipping
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default React.memo(ProductCard);
