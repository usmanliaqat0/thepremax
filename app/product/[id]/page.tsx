"use client";

import { useState, useEffect } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshLoader } from "@/components/ui/loader";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/currency";
import { Product } from "@/lib/types";

const ProductDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useScrollToTop();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch product");
        }

        if (data.success && data.data) {
          setProduct(data.data);

          const relatedResponse = await fetch(
            `/api/products?category=${data.data.categoryId}&limit=4`
          );
          const relatedData = await relatedResponse.json();

          if (relatedData.success && relatedData.data) {
            const filtered = relatedData.data.filter(
              (p: Product) => p._id !== data.data._id
            );
            setRelatedProducts(filtered);
          }
        } else {
          throw new Error("Product not found");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch product"
        );
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <RefreshLoader size="lg" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    notFound();
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleBuyNow = async () => {
    setIsBuyingNow(true);

    try {
      addToCart(product, selectedSize, selectedColor, quantity);

      toast({
        title: "Processing your order",
        description: `${product.name} has been added to your cart. Redirecting to checkout...`,
      });

      setTimeout(() => {
        router.push("/checkout");
        setIsBuyingNow(false);
      }, 1000);
    } catch {
      setIsBuyingNow(false);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleWishlist = async () => {
    if (isInWishlist(product._id)) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product, selectedSize, selectedColor);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link has been copied to clipboard.",
      });
    }
  };

  const productImages =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url)
      : ["/placeholder-product.jpg"];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "White", "Gray", "Navy", "Red"];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/shop">Shop</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/category/${
                    product.category?.slug || product.categoryId
                  }`}
                >
                  {product.category?.name || "Category"}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <div className="mb-6">
          <Link href="/shop">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square mb-4">
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
                priority
              />
              {product.featured && (
                <Badge className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-accent text-accent-foreground text-xs sm:text-sm">
                  Featured
                </Badge>
              )}
            </div>

            {/* Image Thumbnails - Only show if there are multiple images */}
            {productImages.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square w-16 sm:w-20 md:w-32 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-primary mb-2">
                {product.name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                {product.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        i < 4
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  (4.0) 124 reviews
                </span>
              </div>

              <div className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">
                {formatPrice(product.basePrice)}
                {product.compareAtPrice &&
                  product.compareAtPrice > product.basePrice && (
                    <span className="text-base sm:text-lg text-muted-foreground line-through ml-2">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
              </div>
            </div>

            {/* Product Options */}
            {product.category?.name?.toLowerCase() === "shirts" && (
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Color
                  </label>
                  <Select
                    value={selectedColor}
                    onValueChange={setSelectedColor}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10"
                >
                  -
                </Button>
                <span className="w-12 text-center text-sm sm:text-base">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {/* Primary Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  size="lg"
                  disabled={
                    product.category?.name?.toLowerCase() === "shirts" &&
                    (!selectedSize || !selectedColor)
                  }
                >
                  <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">
                    {isInCart(product._id) ? "Added to Cart" : "Add to Cart"}
                  </span>
                </Button>

                <Button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0"
                  size="lg"
                  disabled={
                    isBuyingNow ||
                    (product.category?.name?.toLowerCase() === "shirts" &&
                      (!selectedSize || !selectedColor))
                  }
                >
                  {isBuyingNow ? (
                    <div className="flex items-center">
                      <RefreshLoader
                        size="sm"
                        variant="light"
                        className="mr-2"
                      />
                      <span className="text-sm sm:text-base">
                        Processing...
                      </span>
                    </div>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">Buy Now</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Secondary Action Buttons */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleWishlist}
                  className="flex items-center justify-center gap-2"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isInWishlist(product._id)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                  <span className="text-xs sm:text-sm">
                    {isInWishlist(product._id)
                      ? "In Wishlist"
                      : "Add to Wishlist"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Share</span>
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 pt-6 sm:pt-8 border-t">
              <div className="flex items-center gap-3">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="text-xs sm:text-sm">
                  Free shipping on orders over $50
                </span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="text-xs sm:text-sm">30-day return policy</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="text-xs sm:text-sm">
                  2-year warranty included
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <span className="text-xs sm:text-sm">
                  Fast 2-3 day delivery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading font-bold text-primary mb-4">
                Related Products
              </h2>
              <p className="text-muted-foreground">
                You might also like these items
              </p>
            </div>

            <ProductGrid products={relatedProducts} title="" />
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
