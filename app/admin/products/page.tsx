"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Package,
  TrendingUp,
  Star,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import ProductDialog from "@/components/admin/ProductDialog";
import ProductViewDialog from "@/components/admin/ProductViewDialog";
import { toast } from "sonner";
import { useAdminData } from "@/hooks/use-admin-data";
import { useDialog } from "@/hooks/use-dialog";
import {
  AdminDataTable,
  TableColumn,
  TableAction,
} from "@/components/admin/AdminDataTable";
import { format } from "date-fns";

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

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Use the custom dialog hook for better state management
  const productDialog = useDialog({
    onOpenChange: (open) => {
      if (!open) {
        setEditingProduct(null);
      }
    },
  });

  const productViewDialog = useDialog({
    onOpenChange: (open) => {
      if (!open) {
        setViewingProduct(null);
      }
    },
  });

  // Use the new hook for fetching all products
  const {
    data: products,
    isLoading,
    error,
    refresh,
    setData,
  } = useAdminData<Product>({
    endpoint: "/api/admin/products",
    refreshTrigger,
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories?all=true");
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    setEditingProduct(null);
    productDialog.openDialog();
  };

  const handleProductSaved = () => {
    productDialog.closeDialog();
    setRefreshTrigger((prev) => prev + 1);
    toast.success("Product saved successfully");
  };

  const handleDelete = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        // Update local data
        setData(products.filter((p) => p._id !== product._id));
        toast.success("Product deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const handleRefresh = () => {
    refresh();
    toast.success("Products refreshed");
  };

  // Calculate stats from all products
  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    featured: products.filter((p) => p.featured).length,
    onSale: products.filter((p) => p.onSale).length,
    outOfStock: products.filter((p) => !p.inStock).length,
    totalRevenue: products.reduce(
      (sum, p) => sum + p.basePrice * p.totalSold,
      0
    ),
    averageRating:
      products.length > 0
        ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
        : 0,
  };

  // Helper functions for rendering
  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      archived: "bg-red-100 text-red-800",
    };
    return (
      <Badge
        variant="outline"
        className={colors[status as keyof typeof colors] || "bg-gray-100"}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c._id === categoryId);
    return category ? category.name : "Unknown";
  };

  // Table columns configuration
  const columns: TableColumn<Product>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "categoryId",
      label: "Category",
      render: (item) => getCategoryName(item.categoryId),
    },
    {
      key: "basePrice",
      label: "Price",
      render: (item) => `$${item.basePrice.toFixed(2)}`,
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "inStock",
      label: "Stock",
      render: (item) => (
        <Badge variant={item.inStock ? "default" : "destructive"}>
          {item.inStock ? "In Stock" : "Out of Stock"}
        </Badge>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (item) => `${item.rating.toFixed(1)} (${item.reviewCount})`,
      sortable: true,
    },
    {
      key: "totalSold",
      label: "Sold",
      render: (item) => item.totalSold,
      sortable: true,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (item) => format(new Date(item.createdAt), "MMM dd, yyyy"),
      sortable: true,
    },
  ];

  // Dynamic actions
  const getActions = (): TableAction<Product>[] => {
    const actions: TableAction<Product>[] = [];

    actions.push({
      label: "View",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (product) => {
        setViewingProduct(product);
        productViewDialog.openDialog();
      },
    });

    actions.push({
      label: "Edit",
      icon: <Edit className="h-4 w-4 mr-2" />,
      onClick: (product) => {
        setEditingProduct(product);
        productDialog.openDialog();
      },
    });

    actions.push({
      label: "Delete",
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: (product) => handleDelete(product),
      variant: "destructive",
      confirm: {
        title: "Delete Product",
        description:
          "Are you sure you want to delete this product? This action cannot be undone.",
      },
    });

    return actions;
  };

  // Filter options
  const statusFilterOptions = [
    { key: "all", label: "All Status", value: "all" },
    { key: "active", label: "Active", value: "active" },
    { key: "inactive", label: "Inactive", value: "inactive" },
    { key: "pending", label: "Pending", value: "pending" },
    { key: "archived", label: "Archived", value: "archived" },
  ];

  const categoryFilterOptions = [
    { key: "all", label: "All Categories", value: "all" },
    ...categories.map((cat) => ({
      key: cat._id,
      label: cat.name,
      value: cat._id,
    })),
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Error loading products: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Products
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <Package className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active
            </p>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Featured
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold">{stats.featured}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onSale} on sale
            </p>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-red-500">
              {stats.outOfStock}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Avg Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold">
              {stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </div>
        </Card>
      </div>

      {/* Products Data Table */}
      <AdminDataTable
        title="Products"
        data={products}
        columns={columns}
        loading={isLoading}
        searchable={true}
        searchPlaceholder="Search by name..."
        searchKey="name"
        filters={[
          {
            key: "status",
            label: "Filter by status",
            options: statusFilterOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
          {
            key: "categoryId",
            label: "Filter by category",
            options: categoryFilterOptions,
            value: categoryFilter,
            onChange: setCategoryFilter,
          },
        ]}
        actions={getActions}
        onRefresh={handleRefresh}
        emptyMessage="No products found"
        emptyIcon={<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        itemsPerPage={10}
        showPagination={true}
      />

      {/* Product Dialog */}
      <ProductDialog
        open={productDialog.open}
        onOpenChange={productDialog.onOpenChange}
        product={editingProduct}
        categories={categories}
        onSuccess={handleProductSaved}
      />

      {/* Product View Dialog */}
      <ProductViewDialog
        product={viewingProduct}
        open={productViewDialog.open}
        onOpenChange={productViewDialog.onOpenChange}
        categories={categories}
      />
    </div>
  );
}
