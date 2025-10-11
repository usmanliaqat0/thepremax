"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

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

interface CategoryViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export default function CategoryViewDialog({
  open,
  onOpenChange,
  category,
}: CategoryViewDialogProps) {
  if (!category) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Category Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-sm font-medium">{category.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Slug
                </label>
                <p className="text-sm font-mono">/{category.slug}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-1">
                  <Badge className={getStatusColor(category.status)}>
                    {category.status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Display Order
                </label>
                <p className="text-sm">{category.order}</p>
              </div>
            </div>

            {category.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="text-sm mt-1">{category.description}</p>
              </div>
            )}

            {category.image && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Image
                </label>
                <div className="mt-2">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={200}
                    height={200}
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SEO Information */}
          {(category.seoTitle || category.seoDescription) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SEO Information</h3>

              {category.seoTitle && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    SEO Title
                  </label>
                  <p className="text-sm mt-1">{category.seoTitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.seoTitle.length}/60 characters
                  </p>
                </div>
              )}

              {category.seoDescription && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    SEO Description
                  </label>
                  <p className="text-sm mt-1">{category.seoDescription}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.seoDescription.length}/160 characters
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Statistics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Statistics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Products
                </label>
                <p className="text-sm font-medium">
                  {category.productCount || 0}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Subcategories
                </label>
                <p className="text-sm font-medium">
                  {category.subcategories?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Timestamps</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(category.createdAt), {
                    addSuffix: true,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(category.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(category.updatedAt), {
                    addSuffix: true,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(category.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Subcategories */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Subcategories</h3>

              <div className="space-y-2">
                {category.subcategories.map((subcategory) => (
                  <div
                    key={subcategory._id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{subcategory.name}</p>
                      <p className="text-sm text-muted-foreground">
                        /{subcategory.slug}
                      </p>
                    </div>
                    <Badge className={getStatusColor(subcategory.status)}>
                      {subcategory.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
