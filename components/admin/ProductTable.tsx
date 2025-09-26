"use client";

import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Star, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import AdminTable, {
  TableColumn,
  FilterOption,
  ActionItem,
} from "./AdminTable";

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
  onSearch: (search: string) => void;
  onStatusFilter: (status: string) => void;
  onCategoryFilter: (categoryId: string) => void;
  onFeaturedFilter: (featured: string) => void;
  onSaleFilter: (onSale: string) => void;
  onStockFilter: (inStock: string) => void;
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  featuredFilter: string;
  saleFilter: string;
  stockFilter: string;
  isLoading: boolean;

  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function ProductTable({
  products,
  onEdit,
  onRefresh,
  onSearch,
  onStatusFilter,
  onCategoryFilter,
  onFeaturedFilter,
  onSaleFilter,
  onStockFilter,
  searchTerm,
  statusFilter,
  categoryFilter,
  featuredFilter,
  saleFilter,
  stockFilter,
  isLoading,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ProductTableProps) {
  const handleDelete = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Product deleted successfully");
        onRefresh();
      } else {
        toast.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDiscountPercentage = (
    basePrice: number,
    compareAtPrice?: number
  ) => {
    if (compareAtPrice && compareAtPrice > basePrice) {
      return Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
    }
    return 0;
  };

  const columns: TableColumn<Product>[] = [
    {
      key: "product",
      header: "Product",
      render: (product) => (
        <div className="space-y-1">
          <div className="font-medium line-clamp-1">{product.name}</div>
          <div className="text-sm text-muted-foreground line-clamp-1">
            {product.description}
          </div>
          <div className="text-xs text-muted-foreground">/{product.slug}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (product) => (
        <span className="text-sm text-muted-foreground">
          {product.category?.name || "Unknown"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product) => {
        const discountPercentage = getDiscountPercentage(
          product.basePrice,
          product.compareAtPrice
        );
        return (
          <div className="space-y-1">
            <div className="font-medium">${product.basePrice.toFixed(2)}</div>
            {product.compareAtPrice &&
              product.compareAtPrice > product.basePrice && (
                <div className="text-sm text-muted-foreground line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </div>
              )}
            {discountPercentage > 0 && (
              <div className="text-xs text-green-600 font-medium">
                -{discountPercentage}%
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (product) => (
        <Badge className={getStatusColor(product.status)}>
          {product.status}
        </Badge>
      ),
    },
    {
      key: "flags",
      header: "Flags",
      render: (product) => (
        <div className="flex flex-wrap gap-1">
          {product.featured && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {product.topRated && (
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Top Rated
            </Badge>
          )}
          {product.onSale && (
            <Badge variant="secondary" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              On Sale
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (product) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={product.inStock ? "default" : "destructive"}
            className="text-xs"
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Badge>
          {product.totalSold > 0 && (
            <span className="text-xs text-muted-foreground">
              ({product.totalSold} sold)
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (product) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(product.createdAt), {
            addSuffix: true,
          })}
        </span>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      value: statusFilter,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
        { value: "archived", label: "Archived" },
      ],
    },
    {
      key: "category",
      label: "Category",
      value: categoryFilter,
      options: [

      ],
    },
    {
      key: "featured",
      label: "Featured",
      value: featuredFilter,
      options: [
        { value: "true", label: "Featured" },
        { value: "false", label: "Not Featured" },
      ],
    },
    {
      key: "sale",
      label: "On Sale",
      value: saleFilter,
      options: [
        { value: "true", label: "On Sale" },
        { value: "false", label: "Not On Sale" },
      ],
    },
    {
      key: "stock",
      label: "Stock",
      value: stockFilter,
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
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: () => {},
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: onEdit,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: () => {},
      variant: "destructive",
    },
  ];

  return (
    <AdminTable
      data={products}
      columns={columns}
      actions={actions}
      filters={filters}
      searchPlaceholder="Search products..."
      emptyMessage="No products found"
      isLoading={isLoading}
      onSearch={onSearch}
      onFilter={(key, value) => {
        switch (key) {
          case "status":
            onStatusFilter(value);
            break;
          case "category":
            onCategoryFilter(value);
            break;
          case "featured":
            onFeaturedFilter(value);
            break;
          case "sale":
            onSaleFilter(value);
            break;
          case "stock":
            onStockFilter(value);
            break;
        }
      }}
      onDelete={handleDelete}
      deleteTitle="Delete Product"
      deleteDescription={(product) =>
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
      }
      searchValue={searchTerm}
      filterValues={{
        status: statusFilter,
        category: categoryFilter,
        featured: featuredFilter,
        sale: saleFilter,
        stock: stockFilter,
      }}
      pagination={
        onPageChange
          ? {
              currentPage,
              totalPages,
              onPageChange,
            }
          : undefined
      }
    />
  );
}
