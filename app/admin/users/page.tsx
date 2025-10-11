"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshLoader } from "@/components/ui/loader";
import {
  Mail,
  Phone,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { User } from "@/lib/types";
import UserEditDialog from "@/components/admin/UserEditDialog";
import UserViewDialog from "@/components/admin/UserViewDialog";
import { showSuccessMessage, showErrorMessage } from "@/lib/error-handler";
import { useAdminData } from "@/hooks/use-admin-data";
import { useDialog } from "@/hooks/use-dialog";
import {
  AdminDataTable,
  TableColumn,
  TableAction,
} from "@/components/admin/AdminDataTable";
import { format } from "date-fns";

export default function UsersManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [refreshTrigger] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Use the custom dialog hook for better state management
  const viewDialog = useDialog({
    onOpenChange: (open) => {
      if (!open) {
        setSelectedUser(null);
      }
    },
  });

  const editDialog = useDialog({
    onOpenChange: (open) => {
      if (!open) {
        setSelectedUser(null);
      }
    },
  });

  // Use the new hook for fetching all users
  const {
    data: users,
    isLoading: loading,
    error,
    refresh,
    setData,
  } = useAdminData<User>({
    endpoint: "/api/admin/users",
    refreshTrigger,
  });

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setData(users.filter((user) => user.id !== userId));
        showSuccessMessage("User deleted successfully");
      } else {
        showErrorMessage(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showErrorMessage("Failed to delete user. Please try again.");
    }
  };

  const handleToggleUserStatus = async (
    userId: string,
    newStatus: "active" | "inactive"
  ) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setData(
          users.map((user) =>
            user.id === userId ? { ...user, status: newStatus } : user
          )
        );
        showSuccessMessage(
          `User ${
            newStatus === "active" ? "activated" : "deactivated"
          } successfully`
        );
      } else {
        showErrorMessage(data.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      showErrorMessage("Failed to update user status. Please try again.");
    }
  };

  const handleRefresh = () => {
    refresh();
    showSuccessMessage("Users refreshed successfully");
  };

  // Calculate stats from all users
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    verifiedEmails: users.filter((u) => u.isEmailVerified).length,
    verifiedPhones: users.filter((u) => u.isPhoneVerified).length,
  };

  // Helper functions for rendering
  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
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

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      customer: "bg-blue-100 text-blue-800",
    };
    return (
      <Badge
        variant="outline"
        className={colors[role as keyof typeof colors] || "bg-gray-100"}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  // Table columns configuration
  const columns: TableColumn<User>[] = [
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
      key: "role",
      label: "Role",
      render: (item) => getRoleBadge(item.role),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "isEmailVerified",
      label: "Email Verified",
      render: (item) => (
        <Badge variant={item.isEmailVerified ? "default" : "secondary"}>
          {item.isEmailVerified ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "isPhoneVerified",
      label: "Phone Verified",
      render: (item) => (
        <Badge variant={item.isPhoneVerified ? "default" : "secondary"}>
          {item.isPhoneVerified ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (item) => format(new Date(item.createdAt), "MMM dd, yyyy"),
      sortable: true,
    },
  ];

  // Dynamic actions based on user status
  const getActions = (item: User): TableAction<User>[] => {
    const actions: TableAction<User>[] = [];

    actions.push({
      label: "View",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (user) => {
        setSelectedUser(user);
        viewDialog.openDialog();
      },
    });

    actions.push({
      label: "Edit",
      icon: <Edit className="h-4 w-4 mr-2" />,
      onClick: (user) => {
        setSelectedUser(user);
        editDialog.openDialog();
      },
    });

    if (item.status !== "active") {
      actions.push({
        label: "Activate",
        icon: <UserCheck className="h-4 w-4 mr-2" />,
        onClick: (user) => handleToggleUserStatus(user.id, "active"),
      });
    }

    if (item.status !== "inactive") {
      actions.push({
        label: "Deactivate",
        icon: <UserX className="h-4 w-4 mr-2" />,
        onClick: (user) => handleToggleUserStatus(user.id, "inactive"),
      });
    }

    actions.push({
      label: "Delete",
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: (user) => handleDeleteUser(user.id),
      variant: "destructive",
      confirm: {
        title: "Delete User",
        description:
          "Are you sure you want to delete this user? This action cannot be undone.",
      },
    });

    return actions;
  };

  // Filter options
  const statusFilterOptions = [
    { key: "all", label: "All Status", value: "all" },
    { key: "active", label: "Active", value: "active" },
    { key: "inactive", label: "Inactive", value: "inactive" },
  ];

  const roleFilterOptions = [
    { key: "all", label: "All Roles", value: "all" },
    { key: "admin", label: "Admin", value: "admin" },
    { key: "customer", label: "Customer", value: "customer" },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Error loading users: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            User Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage user accounts, permissions, and settings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <RefreshLoader size="sm" className="mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        <Card className="p-3 sm:p-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <p className="text-xs text-muted-foreground text-center">
              Active Users
            </p>
            <p className="text-base sm:text-lg font-bold">{stats.active}</p>
          </div>
        </Card>
        <Card className="p-3 sm:p-6">
          <div className="flex flex-col items-center gap-2">
            <UserX className="h-5 w-5 text-red-600" />
            <p className="text-xs text-muted-foreground text-center">
              Inactive Users
            </p>
            <p className="text-base sm:text-lg font-bold">{stats.inactive}</p>
          </div>
        </Card>
        <Card className="p-3 sm:p-6">
          <div className="flex flex-col items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <p className="text-xs text-muted-foreground text-center">
              Verified Emails
            </p>
            <p className="text-base sm:text-lg font-bold">
              {stats.verifiedEmails}
            </p>
          </div>
        </Card>
        <Card className="p-3 sm:p-6">
          <div className="flex flex-col items-center gap-2">
            <Phone className="h-5 w-5 text-purple-600" />
            <p className="text-xs text-muted-foreground text-center">
              Verified Phones
            </p>
            <p className="text-base sm:text-lg font-bold">
              {stats.verifiedPhones}
            </p>
          </div>
        </Card>
      </div>

      {/* Users Data Table */}
      <AdminDataTable
        title="Users"
        data={users}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search by email or name..."
        searchKey="email"
        idKey="id"
        filters={[
          {
            key: "status",
            label: "Filter by status",
            options: statusFilterOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
          {
            key: "role",
            label: "Filter by role",
            options: roleFilterOptions,
            value: roleFilter,
            onChange: setRoleFilter,
          },
        ]}
        actions={getActions}
        onRefresh={handleRefresh}
        emptyMessage="No users found"
        emptyIcon={
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        }
        itemsPerPage={10}
        showPagination={true}
      />

      {selectedUser && (
        <>
          <UserViewDialog
            user={selectedUser}
            open={viewDialog.open}
            onOpenChange={viewDialog.onOpenChange}
          />
          <UserEditDialog
            user={selectedUser}
            open={editDialog.open}
            onOpenChange={editDialog.onOpenChange}
            loading={editLoading}
            onUserUpdated={async (updatedUser) => {
              setEditLoading(true);
              try {
                const res = await fetch(`/api/admin/users/${updatedUser.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updatedUser),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setData(
                    users.map((u) => (u.id === updatedUser.id ? data.data : u))
                  );
                  showSuccessMessage("User updated successfully");
                } else {
                  showErrorMessage(data.message || "Failed to update user");
                }
              } catch (error) {
                console.error("Error updating user:", error);
                showErrorMessage("Failed to update user. Please try again.");
              } finally {
                setEditLoading(false);
              }
            }}
          />
        </>
      )}
    </div>
  );
}
