"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AdminPermissions } from "@/lib/types";
import { usePermissionUpdate } from "@/hooks/use-permission-update";
import { Loader2, Save, X } from "lucide-react";

interface PermissionEditorProps {
  adminId: string;
  adminName: string;
  currentPermissions: AdminPermissions;
  onClose: () => void;
  onSuccess?: () => void;
}

const PERMISSION_SECTIONS = [
  {
    key: "dashboard",
    title: "Dashboard",
    permissions: [{ key: "view", label: "View Dashboard" }],
  },
  {
    key: "users",
    title: "User Management",
    permissions: [
      { key: "view", label: "View Users" },
      { key: "create", label: "Create Users" },
      { key: "update", label: "Update Users" },
      { key: "delete", label: "Delete Users" },
      { key: "export", label: "Export Users" },
    ],
  },
  {
    key: "products",
    title: "Product Management",
    permissions: [
      { key: "view", label: "View Products" },
      { key: "create", label: "Create Products" },
      { key: "update", label: "Update Products" },
      { key: "delete", label: "Delete Products" },
      { key: "export", label: "Export Products" },
    ],
  },
  {
    key: "categories",
    title: "Category Management",
    permissions: [
      { key: "view", label: "View Categories" },
      { key: "create", label: "Create Categories" },
      { key: "update", label: "Update Categories" },
      { key: "delete", label: "Delete Categories" },
    ],
  },
  {
    key: "orders",
    title: "Order Management",
    permissions: [
      { key: "view", label: "View Orders" },
      { key: "update", label: "Update Orders" },
      { key: "delete", label: "Delete Orders" },
      { key: "export", label: "Export Orders" },
    ],
  },
  {
    key: "promoCodes",
    title: "Promo Code Management",
    permissions: [
      { key: "view", label: "View Promo Codes" },
      { key: "create", label: "Create Promo Codes" },
      { key: "update", label: "Update Promo Codes" },
      { key: "delete", label: "Delete Promo Codes" },
    ],
  },
  {
    key: "subscriptions",
    title: "Subscription Management",
    permissions: [
      { key: "view", label: "View Subscriptions" },
      { key: "update", label: "Update Subscriptions" },
      { key: "export", label: "Export Subscriptions" },
    ],
  },
  {
    key: "messages",
    title: "Message Management",
    permissions: [
      { key: "view", label: "View Messages" },
      { key: "update", label: "Update Messages" },
      { key: "delete", label: "Delete Messages" },
    ],
  },
  {
    key: "admins",
    title: "Admin Management",
    permissions: [
      { key: "view", label: "View Admins" },
      { key: "create", label: "Create Admins" },
      { key: "update", label: "Update Admins" },
      { key: "delete", label: "Delete Admins" },
    ],
  },
  {
    key: "stats",
    title: "Statistics",
    permissions: [
      { key: "view", label: "View Statistics" },
      { key: "export", label: "Export Statistics" },
    ],
  },
];

export default function PermissionEditor({
  adminId,
  adminName,
  currentPermissions,
  onClose,
  onSuccess,
}: PermissionEditorProps) {
  const [permissions, setPermissions] =
    useState<AdminPermissions>(currentPermissions);
  const [loading, setLoading] = useState(false);
  const { updateAdminPermissions } = usePermissionUpdate();

  useEffect(() => {
    setPermissions(currentPermissions);
  }, [currentPermissions]);

  const handlePermissionChange = (
    section: string,
    permission: string,
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof AdminPermissions],
        [permission]: checked,
      },
    }));
  };

  const handleSectionToggle = (section: string, checked: boolean) => {
    const sectionData = PERMISSION_SECTIONS.find((s) => s.key === section);
    if (!sectionData) return;

    setPermissions((prev) => ({
      ...prev,
      [section]: sectionData.permissions.reduce((acc, perm) => {
        acc[perm.key] = checked;
        return acc;
      }, {} as Record<string, boolean>),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateAdminPermissions(adminId, permissions);
      if (result.success) {
        onSuccess?.();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const isSectionFullyChecked = (section: string) => {
    const sectionData = PERMISSION_SECTIONS.find((s) => s.key === section);
    if (!sectionData) return false;

    return sectionData.permissions.every(
      (perm) =>
        (
          permissions[section as keyof AdminPermissions] as Record<
            string,
            boolean
          >
        )?.[perm.key] === true
    );
  };

  const isSectionPartiallyChecked = (section: string) => {
    const sectionData = PERMISSION_SECTIONS.find((s) => s.key === section);
    if (!sectionData) return false;

    const checkedCount = sectionData.permissions.filter(
      (perm) =>
        (
          permissions[section as keyof AdminPermissions] as Record<
            string,
            boolean
          >
        )?.[perm.key] === true
    ).length;

    return checkedCount > 0 && checkedCount < sectionData.permissions.length;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Edit Permissions - {adminName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage what this admin can access and do
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[70vh]">
          <div className="space-y-6">
            {PERMISSION_SECTIONS.map((section) => (
              <div key={section.key} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`section-${section.key}`}
                    checked={isSectionFullyChecked(section.key)}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLInputElement).indeterminate =
                          isSectionPartiallyChecked(section.key);
                      }
                    }}
                    onCheckedChange={(checked) =>
                      handleSectionToggle(section.key, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`section-${section.key}`}
                    className="text-base font-semibold"
                  >
                    {section.title}
                  </Label>
                </div>
                <div className="ml-6 space-y-2">
                  {section.permissions.map((permission) => (
                    <div
                      key={permission.key}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${section.key}-${permission.key}`}
                        checked={
                          (
                            permissions[
                              section.key as keyof AdminPermissions
                            ] as Record<string, boolean>
                          )?.[permission.key] === true
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
                <Separator />
              </div>
            ))}
          </div>
        </CardContent>
        <div className="flex justify-end space-x-2 p-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Permissions
          </Button>
        </div>
      </Card>
    </div>
  );
}
