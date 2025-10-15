"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { AdminPermissions } from "@/lib/types";

interface AdminViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    permissions?: AdminPermissions;
    createdAt: string;
    lastLogin?: string;
  } | null;
}

const PERMISSION_SECTIONS = [
  {
    key: "dashboard",
    label: "Dashboard",
    permissions: [{ key: "view", label: "View" }],
  },
  {
    key: "users",
    label: "Users",
    permissions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "update", label: "Update" },
      { key: "delete", label: "Delete" },
      { key: "export", label: "Export" },
    ],
  },
  {
    key: "products",
    label: "Products",
    permissions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "update", label: "Update" },
      { key: "delete", label: "Delete" },
      { key: "export", label: "Export" },
    ],
  },
  {
    key: "categories",
    label: "Categories",
    permissions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "update", label: "Update" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "orders",
    label: "Orders",
    permissions: [
      { key: "view", label: "View" },
      { key: "update", label: "Update" },
      { key: "delete", label: "Delete" },
      { key: "export", label: "Export" },
    ],
  },
  {
    key: "promoCodes",
    label: "Promo Codes",
    permissions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "update", label: "Update" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "subscriptions",
    label: "Subscriptions",
    permissions: [
      { key: "view", label: "View" },
      { key: "update", label: "Update" },
      { key: "export", label: "Export" },
    ],
  },
  {
    key: "messages",
    label: "Messages",
    permissions: [
      { key: "view", label: "View" },
      { key: "update", label: "Update" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "admins",
    label: "Admins",
    permissions: [
      { key: "view", label: "View" },
      { key: "create", label: "Create" },
      { key: "update", label: "Update" },
      { key: "delete", label: "Delete" },
    ],
  },
  {
    key: "stats",
    label: "Statistics",
    permissions: [
      { key: "view", label: "View" },
      { key: "export", label: "Export" },
    ],
  },
];

export default function AdminViewDialog({
  open,
  onOpenChange,
  admin,
}: AdminViewDialogProps) {
  if (!admin) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Admin Details</DialogTitle>
          <DialogDescription>
            View admin information and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-sm">
                    {admin.firstName} {admin.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-sm">{admin.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(admin.status)}>
                      {admin.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created
                  </label>
                  <p className="text-sm">
                    {formatDistanceToNow(new Date(admin.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Login
                  </label>
                  <p className="text-sm">
                    {admin.lastLogin
                      ? formatDistanceToNow(new Date(admin.lastLogin), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PERMISSION_SECTIONS.map((section) => (
                  <div key={section.key} className="space-y-3">
                    <h4 className="font-medium text-sm">{section.label}</h4>
                    <div className="space-y-2">
                      {section.permissions.map((permission) => {
                        const hasPermission =
                          (
                            admin.permissions?.[
                              section.key as keyof AdminPermissions
                            ] as Record<string, boolean>
                          )?.[permission.key] || false;
                        return (
                          <div
                            key={permission.key}
                            className="flex items-center space-x-2"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                hasPermission ? "bg-green-500" : "bg-gray-300"
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                hasPermission
                                  ? "text-gray-900"
                                  : "text-gray-500"
                              }`}
                            >
                              {permission.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
