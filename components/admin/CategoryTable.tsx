"use client";

import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ClientSideAdminTable, {
  TableColumn,
  ActionItem,
} from "./ClientSideAdminTable";
import { FilterOption } from "@/hooks/use-client-pagination";

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

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onView: (category: Category) => void;
  onRefresh: () => void;
  onDelete?: (category: Category) => Promise<void>;
  isLoading: boolean;
}

export default function CategoryTable({
  categories,
  onEdit,
  onView,
  onDelete,
  isLoading,
}: CategoryTableProps) {
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
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  const actions: ActionItem<Category>[] = [
    {
      key: "view",
      label: "View",
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: onView,
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
      onClick: onDelete || (() => {}),
      variant: "destructive",
    },
  ];

  return (
    <ClientSideAdminTable
      data={categories}
      columns={columns}
      actions={actions}
      filters={filters}
      searchFields={["name", "slug", "description"]}
      searchPlaceholder="Search categories..."
      emptyMessage="No categories found"
      isLoading={isLoading}
      onDelete={onDelete}
      deleteTitle="Delete Category"
      deleteDescription={(category) =>
        `Are you sure you want to delete "${
          category.name
        }"? This action cannot be undone.${
          category.productCount && category.productCount > 0
            ? ` Warning: This category has ${category.productCount} products. You must move or delete these products first.`
            : ""
        }`
      }
    />
  );
}
