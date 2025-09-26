"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onRefresh: () => void;
  onSearch: (search: string) => void;
  onStatusFilter: (status: string) => void;
  searchTerm: string;
  statusFilter: string;
  isLoading: boolean;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function CategoryTable({
  categories,
  onEdit,
  onRefresh,
  onSearch,
  onStatusFilter,
  searchTerm,
  statusFilter,
  isLoading,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: CategoryTableProps) {
  const handleDelete = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Category deleted successfully");
        onRefresh();
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
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

  const columns: TableColumn<Category>[] = [
    {
      key: "name",
      header: "Name",
      render: (category) => (
        <div className="space-y-1">
          <div className="font-medium">{category.name}</div>
          <div className="text-sm text-muted-foreground">/{category.slug}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (category) => (
        <Badge className={getStatusColor(category.status)}>
          {category.status}
        </Badge>
      ),
    },
    {
      key: "order",
      header: "Order",
      render: (category) => category.order,
    },
    {
      key: "productCount",
      header: "Products",
      render: (category) => (
        <span className="text-sm text-muted-foreground">
          {category.productCount || 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (category) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(category.createdAt), {
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
      ],
    },
  ];

  const actions: ActionItem<Category>[] = [
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
      onClick: () => {}, // Will be handled by AdminTable
      variant: "destructive",
    },
  ];

  return (
    <AdminTable
      data={categories}
      columns={columns}
      actions={actions}
      filters={filters}
      searchPlaceholder="Search categories..."
      emptyMessage="No categories found"
      isLoading={isLoading}
      onSearch={onSearch}
      onFilter={(key, value) => {
        if (key === "status") onStatusFilter(value);
      }}
      onDelete={handleDelete}
      deleteTitle="Delete Category"
      deleteDescription={(category) => (
        <>
          Are you sure you want to delete &quot;{category.name}&quot;? This
          action cannot be undone.
          {category.productCount && category.productCount > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
              <strong>Warning:</strong> This category has{" "}
              {category.productCount} products. You must move or delete these
              products first.
            </div>
          )}
        </>
      )}
      searchValue={searchTerm}
      filterValues={{ status: statusFilter }}
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
