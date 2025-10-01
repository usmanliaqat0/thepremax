"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, TrendingUp, Star } from "lucide-react";
import ProductDialog from "@/components/admin/ProductDialog";
import ProductTable from "@/components/admin/ProductTable";
import { toast } from "sonner";
import { useAdminData } from "@/hooks/use-admin-data";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    handleDialogClose();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
          >
            <Package className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featured}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onSale} on sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats.outOfStock}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Across all products</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductTable
            products={products}
            onEdit={handleEdit}
            onRefresh={handleRefresh}
            onDelete={handleDelete}
            isLoading={isLoading}
            categories={categories}
          />
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        product={editingProduct}
        categories={categories}
        onSuccess={handleProductSaved}
      />
    </div>
  );
}
