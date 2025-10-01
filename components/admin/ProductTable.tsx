"use client";

import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Star, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import ClientSideAdminTable, {
  TableColumn,
  ActionItem,
} from "./ClientSideAdminTable";
import { FilterOption } from "@/hooks/use-client-pagination";

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

interface Product extends Record<string, unknown> {
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
  featured: boolean;
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

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onRefresh: () => void;
  onDelete: (product: Product) => Promise<void>;
  isLoading: boolean;
  categories: Category[];
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  categories,
}: ProductTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "Active" },
      inactive: { variant: "secondary" as const, label: "Inactive" },
      pending: { variant: "outline" as const, label: "Pending" },
      archived: { variant: "destructive" as const, label: "Archived" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStockBadge = (inStock: boolean) => {
    return inStock ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        In Stock
      </Badge>
    ) : (
      <Badge variant="destructive">Out of Stock</Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const columns: TableColumn<Product>[] = [
    {
      key: "name",
      header: "Product",
      width: "w-[300px]",
      render: (product) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-xs text-muted-foreground">No Image</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{product.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {product.category?.name || "No Category"}
            </div>
            <div className="flex items-center space-x-1 mt-1">
              {product.featured && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {product.onSale && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  On Sale
                </Badge>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "basePrice",
      header: "Price",
      width: "w-[120px]",
      render: (product) => (
        <div className="text-sm">
          <div className="font-medium">{formatPrice(product.basePrice)}</div>
          {product.compareAtPrice &&
            product.compareAtPrice > product.basePrice && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </div>
            )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "w-[100px]",
      render: (product) => getStatusBadge(product.status),
    },
    {
      key: "inStock",
      header: "Stock",
      width: "w-[100px]",
      render: (product) => getStockBadge(product.inStock),
    },
    {
      key: "totalSold",
      header: "Sold",
      width: "w-[80px]",
      render: (product) => (
        <div className="text-sm font-medium">{product.totalSold}</div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      width: "w-[100px]",
      render: (product) => (
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      width: "w-[120px]",
      render: (product) => (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(product.createdAt), {
            addSuffix: true,
          })}
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "categoryId",
      label: "Category",
      options: [
        ...categories.map((category) => ({
          value: category._id,
          label: category.name,
        })),
      ],
    },
    {
      key: "featured",
      label: "Featured",
      options: [
        { value: "true", label: "Featured" },
        { value: "false", label: "Not Featured" },
      ],
    },
    {
      key: "onSale",
      label: "On Sale",
      options: [
        { value: "true", label: "On Sale" },
        { value: "false", label: "Not On Sale" },
      ],
    },
    {
      key: "inStock",
      label: "Stock",
      options: [
        { value: "true", label: "In Stock" },
        { value: "false", label: "Out of Stock" },
      ],
    },
  ];

  const actions: ActionItem<Product>[] = [
    {
      key: "view",
      label: "View",
      icon: <Eye className="w-4 h-4" />,
      onClick: (product) => {
        // Handle view action
        console.log("View product:", product);
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: (product) => onEdit(product),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (product) => onDelete(product),
      variant: "destructive",
    },
  ];

  return (
    <ClientSideAdminTable
      data={products}
      columns={columns}
      actions={actions}
      filters={filters}
      searchFields={["name", "description", "tags"]}
      searchPlaceholder="Search products..."
      emptyMessage="No products found"
      loadingRows={5}
      onDelete={onDelete}
      deleteTitle="Delete Product"
      deleteDescription={(product) =>
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
      }
      itemsPerPage={10}
    />
  );
}
