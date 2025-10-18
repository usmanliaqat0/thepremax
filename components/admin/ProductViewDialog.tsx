"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Star,
  DollarSign,
  Tag,
  Calendar,
  Eye,
  ShoppingCart,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Archive,
} from "lucide-react";
import { format } from "date-fns";
import { formatPrice } from "@/lib/currency";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price?: number;
  images?: string[];
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  categoryId: string;
  category?: Category;
  tags: string[];
  variants: ProductVariant[];
  images: ProductImage[];
  totalSold: number;
  topRated: boolean;
  onSale: boolean;
  status: "active" | "inactive" | "pending" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  rating: number;
  reviewCount: number;
  specifications?: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductViewDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
}

export default function ProductViewDialog({
  product,
  open,
  onOpenChange,
  categories,
}: ProductViewDialogProps) {
  if (!product) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        icon: <CheckCircle className="h-4 w-4" />,
        className: "bg-green-100 text-green-800 border-green-200",
        label: "Active",
      },
      inactive: {
        icon: <XCircle className="h-4 w-4" />,
        className: "bg-gray-100 text-gray-800 border-gray-200",
        label: "Inactive",
      },
      pending: {
        icon: <AlertCircle className="h-4 w-4" />,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending",
      },
      archived: {
        icon: <Archive className="h-4 w-4" />,
        className: "bg-red-100 text-red-800 border-red-200",
        label: "Archived",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;

    return (
      <Badge variant="outline" className={config.className}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c._id === categoryId);
    return category ? category.name : "Unknown";
  };

  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            <div className="flex-shrink-0 self-center sm:self-start">
              {primaryImage ? (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border">
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.alt || product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-gray-100 flex items-center justify-center border">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {product.name}
                  </h2>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    SKU: {product.slug} • ID: {product._id}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                  {getStatusBadge(product.status)}
                  {product.inStock ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-muted-foreground">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm">{product.totalSold} sold</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatPrice(product.basePrice)}
                  </span>
                  {product.compareAtPrice &&
                    product.compareAtPrice > product.basePrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                </div>
                {product.onSale && (
                  <Badge
                    variant="destructive"
                    className="self-center sm:self-start"
                  >
                    On Sale
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {product.topRated && (
              <Badge
                variant="outline"
                className="bg-yellow-100 text-yellow-800"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Top Rated
              </Badge>
            )}
            {product.onSale && (
              <Badge variant="destructive">
                <Tag className="h-3 w-3 mr-1" />
                On Sale
              </Badge>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <p className="text-sm">
                    {getCategoryName(product.categoryId)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-sm text-justify">{product.description}</p>
                </div>
                {product.sourceUrl && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Source URL
                    </label>
                    <a
                      href={product.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View Source
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing & Sales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Base Price
                    </label>
                    <p className="text-lg font-semibold text-green-600">
                      {formatPrice(product.basePrice)}
                    </p>
                  </div>
                  {product.compareAtPrice && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Compare At
                      </label>
                      <p className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.compareAtPrice)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Total Sold
                    </label>
                    <p className="text-sm font-medium">{product.totalSold}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Revenue
                    </label>
                    <p className="text-sm font-medium">
                      {formatPrice(product.basePrice * product.totalSold)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {product.tags && product.tags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {product.specifications && product.specifications.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {product.specifications.map((spec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {(product.sizes.length > 0 || product.colors.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.sizes.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Available Sizes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {product.colors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      Available Colors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <Badge
                          key={color}
                          variant="outline"
                          className="text-xs"
                        >
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {product.variants.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Product Variants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">
                            {variant.size} - {variant.color}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {variant.sku}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {variant.price
                              ? formatPrice(variant.price)
                              : formatPrice(product.basePrice)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {variant.stock}
                          </p>
                        </div>
                        <Badge
                          variant={
                            variant.stock > 0 ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {variant.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(product.seoTitle || product.seoDescription) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  SEO Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.seoTitle && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      SEO Title
                    </label>
                    <p className="text-sm">{product.seoTitle}</p>
                  </div>
                )}
                {product.seoDescription && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      SEO Description
                    </label>
                    <p className="text-sm">{product.seoDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>
                  {format(
                    new Date(product.createdAt),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span>
                  {format(
                    new Date(product.updatedAt),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
