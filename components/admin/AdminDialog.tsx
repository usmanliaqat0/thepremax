"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminPermissions } from "@/lib/types";

const DEFAULT_PERMISSIONS: AdminPermissions = {
  dashboard: { view: false },
  users: {
    view: false,
    create: false,
    update: false,
    delete: false,
    export: false,
  },
  products: {
    view: false,
    create: false,
    update: false,
    delete: false,
    export: false,
  },
  categories: { view: false, create: false, update: false, delete: false },
  orders: { view: false, update: false, delete: false, export: false },
  promoCodes: { view: false, create: false, update: false, delete: false },
  subscriptions: { view: false, update: false, export: false },
  messages: { view: false, update: false, delete: false },
  admins: { view: false, create: false, update: false, delete: false },
  stats: { view: false, export: false },
};

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin?: {
    _id?: string;
    email: string;
    firstName: string;
    lastName: string;
    status?: string;
    permissions?: AdminPermissions;
  } | null;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

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

export default function AdminDialog({
  open,
  onOpenChange,
  admin,
  onSuccess,
}: AdminDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    status: "active",
    permissions: DEFAULT_PERMISSIONS,
  });

  const isEdit = !!admin;

  useEffect(() => {
    if (admin) {
      setFormData({
        email: admin.email || "",
        password: "",
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
        status: admin.status || "active",
        permissions: admin.permissions || DEFAULT_PERMISSIONS,
      });
    } else {
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        status: "active",
        permissions: DEFAULT_PERMISSIONS,
      });
    }
  }, [admin]);

  const handlePermissionChange = (
    section: string,
    permission: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: {
          ...prev.permissions[section as keyof AdminPermissions],
          [permission]: checked,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit
        ? `/api/admin/admins/${admin._id}`
        : "/api/admin/admins";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description:
            data.message ||
            `Admin ${isEdit ? "updated" : "created"} successfully`,
        });
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: "Error",
          description: data.error || "An error occurred",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An error occurred while saving admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Admin" : "Create New Admin"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update admin information and permissions"
              : "Create a new admin account with specific permissions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {isEdit && "(leave blank to keep current)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required={!isEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Permissions</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PERMISSION_SECTIONS.map((section) => (
                <div key={section.key} className="space-y-3">
                  <h4 className="font-medium text-sm">{section.label}</h4>
                  <div className="space-y-2">
                    {section.permissions.map((permission) => (
                      <div
                        key={permission.key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`${section.key}-${permission.key}`}
                          checked={
                            (
                              formData.permissions[
                                section.key as keyof AdminPermissions
                              ] as Record<string, boolean>
                            )?.[permission.key] || false
                          }
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              section.key,
                              permission.key,
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`${section.key}-${permission.key}`}
                          className="text-sm"
                        >
                          {permission.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Admin" : "Create Admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
