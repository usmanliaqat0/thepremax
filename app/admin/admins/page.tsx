"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshLoader } from "@/components/ui/loader";
import {
  UserCog,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
} from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import AdminDialog from "@/components/admin/AdminDialog";
import AdminViewDialog from "@/components/admin/AdminViewDialog";
import PermissionEditor from "@/components/admin/PermissionEditor";
import { showSuccessMessage, showErrorMessage } from "@/lib/error-handler";
import { useAdminData } from "@/hooks/use-admin-data";
import { AdminPermissions } from "@/lib/types";
import { useDialog } from "@/hooks/use-dialog";
import {
  AdminDataTable,
  TableColumn,
  TableAction,
} from "@/components/admin/AdminDataTable";
import { format } from "date-fns";

interface Admin {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
  lastLogin?: string;
  permissions?: AdminPermissions;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  [key: string]: unknown;
}

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

export default function AdminsPage() {
  const { hasPermission } = usePermissions();
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [refreshTrigger] = useState(0);

  const viewDialog = useDialog({
    onOpenChange: (open) => {
      if (!open) {
        setSelectedAdmin(null);
      }
    },
  });

  const editDialog = useDialog({
    onOpenChange: (open) => {
      if (!open) {
        setSelectedAdmin(null);
      }
    },
  });

  const permissionDialog = useDialog({
    onOpenChange: (open) => {
      if (!open) {
        setSelectedAdmin(null);
      }
    },
  });

  const {
    data: admins,
    isLoading: loading,
    error,
    refresh,
    setData,
  } = useAdminData<Admin>({
    endpoint: "/api/admin/admins",
    refreshTrigger,
  });

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const res = await fetch(`/api/admin/admins/${adminId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setData(admins.filter((admin) => admin._id !== adminId));
        showSuccessMessage("Admin deleted successfully");
      } else {
        showErrorMessage(data.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      showErrorMessage("Failed to delete admin. Please try again.");
    }
  };

  const handleToggleAdminStatus = async (
    adminId: string,
    newStatus: "active" | "inactive"
  ) => {
    try {
      const res = await fetch(`/api/admin/admins/${adminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setData(
          admins.map((admin) =>
            admin._id === adminId ? { ...admin, status: newStatus } : admin
          )
        );
        showSuccessMessage(
          `Admin ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully`
        );
      } else {
        showErrorMessage(data.message || "Failed to update admin status");
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      showErrorMessage("Failed to update admin status. Please try again.");
    }
  };

  const handleRefresh = () => {
    refresh();
    showSuccessMessage("Admins refreshed successfully");
  };

  const stats = {
    total: admins.length,
    active: admins.filter((a) => a.status === "active").length,
    inactive: admins.filter((a) => a.status === "inactive").length,
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800",
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

  const columns: TableColumn<Admin>[] = [
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "firstName",
      label: "Name",
      render: (item) => `${item.firstName} ${item.lastName}`,
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (item) => format(new Date(item.createdAt), "MMM dd, yyyy"),
      sortable: true,
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (item) =>
        item.lastLogin
          ? format(new Date(item.lastLogin), "MMM dd, yyyy")
          : "Never",
      sortable: true,
    },
  ];

  const getActions = (item: Admin): TableAction<Admin>[] => {
    const actions: TableAction<Admin>[] = [];

    // View action - available to all admins
    if (hasPermission("admins", "view")) {
      actions.push({
        label: "View",
        icon: <Eye className="h-4 w-4 mr-2" />,
        onClick: (admin) => {
          setSelectedAdmin(admin);
          viewDialog.openDialog();
        },
      });
    }

    // Edit action - only for super admin
    if (hasPermission("admins", "update")) {
      actions.push({
        label: "Edit",
        icon: <Edit className="h-4 w-4 mr-2" />,
        onClick: (admin) => {
          setSelectedAdmin(admin);
          editDialog.openDialog();
        },
      });
    }

    // Edit Permissions action - only for super admin
    if (hasPermission("admins", "update")) {
      actions.push({
        label: "Edit Permissions",
        icon: <Settings className="h-4 w-4 mr-2" />,
        onClick: (admin) => {
          setSelectedAdmin(admin);
          permissionDialog.openDialog();
        },
      });
    }

    // Status toggle - only for super admin
    if (hasPermission("admins", "update")) {
      if (item.status !== "active") {
        actions.push({
          label: "Activate",
          icon: <UserCheck className="h-4 w-4 mr-2" />,
          onClick: (admin) => handleToggleAdminStatus(admin._id, "active"),
        });
      }

      if (item.status !== "inactive") {
        actions.push({
          label: "Deactivate",
          icon: <UserX className="h-4 w-4 mr-2" />,
          onClick: (admin) => handleToggleAdminStatus(admin._id, "inactive"),
        });
      }
    }

    // Delete action - only for super admin
    if (hasPermission("admins", "delete")) {
      actions.push({
        label: "Delete",
        icon: <Trash2 className="h-4 w-4 mr-2" />,
        onClick: (admin) => handleDeleteAdmin(admin._id),
        variant: "destructive",
        confirm: {
          title: "Delete Admin",
          description: `Are you sure you want to delete this admin? This action cannot be undone.`,
        },
      });
    }

    return actions;
  };

  const canCreate = hasPermission("admins", "create");
  const canExport = hasPermission("admins", "export");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground">
            Manage admin accounts and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canExport && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canCreate && (
            <Button
              onClick={() => {
                setSelectedAdmin(null);
                editDialog.openDialog();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <UserCog className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Inactive
                </p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.inactive}
                </p>
              </div>
              <UserX className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <AdminDataTable
        title="Admins"
        data={admins}
        columns={columns}
        actions={getActions}
        searchPlaceholder="Search admins..."
        emptyMessage="No admins found"
      />

      {/* Dialogs */}
      <AdminDialog
        open={editDialog.open}
        onOpenChange={editDialog.onOpenChange}
        admin={selectedAdmin}
        onSuccess={() => {
          refresh();
          editDialog.closeDialog();
        }}
      />

      <AdminViewDialog
        open={viewDialog.open}
        onOpenChange={viewDialog.onOpenChange}
        admin={selectedAdmin}
      />

      {selectedAdmin && (
        <PermissionEditor
          adminId={selectedAdmin._id}
          adminName={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
          currentPermissions={selectedAdmin.permissions || DEFAULT_PERMISSIONS}
          onClose={permissionDialog.closeDialog}
          onSuccess={() => {
            refresh();
            permissionDialog.closeDialog();
          }}
        />
      )}
    </div>
  );
}
