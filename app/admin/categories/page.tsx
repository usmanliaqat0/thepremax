"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import CategoryDialog from "@/components/admin/CategoryDialog";
import CategoryViewDialog from "@/components/admin/CategoryViewDialog";
import CategoryTable from "@/components/admin/CategoryTable";
import { toast } from "sonner";
import { useAdminData } from "@/hooks/use-admin-data";

interface Category extends Record<string, unknown> {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  status: "active" | "inactive";
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  subcategories?: Category[];
  productCount?: number;
}

export default function CategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use the new hook for fetching all categories
  const {
    data: categories,
    isLoading,
    error,
    refresh,
    setData,
  } = useAdminData<Category>({
    endpoint: "/api/admin/categories",
    refreshTrigger,
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleView = (category: Category) => {
    setViewingCategory(category);
    setIsViewDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleViewDialogClose = () => {
    setIsViewDialogOpen(false);
    setViewingCategory(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success("Category saved successfully");
  };

  const handleDelete = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        // Update local data
        setData(categories.filter((c) => c._id !== category._id));
        toast.success("Category deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleRefresh = () => {
    refresh();
    toast.success("Categories refreshed");
  };

  // Calculate stats from all categories
  const stats = {
    total: categories.length,
    active: categories.filter((cat) => cat.status === "active").length,
    inactive: categories.filter((cat) => cat.status === "inactive").length,
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Categories</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Error loading categories: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Categories
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage product categories and their organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <Package className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Categories
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Categories
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently visible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Categories
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Hidden from users</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryTable
            categories={categories}
            onEdit={handleEdit}
            onView={handleView}
            onRefresh={handleRefresh}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        category={editingCategory}
        onSuccess={handleSuccess}
      />

      <CategoryViewDialog
        open={isViewDialogOpen}
        onOpenChange={handleViewDialogClose}
        category={viewingCategory}
      />
    </div>
  );
}
