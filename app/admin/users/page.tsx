"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
} from "lucide-react";
import { User } from "@/lib/types";
import UserEditDialog from "@/components/admin/UserEditDialog";
import UserViewDialog from "@/components/admin/UserViewDialog";
import UserTable from "@/components/admin/UserTable";
import { showSuccessMessage, showErrorMessage } from "@/lib/error-handler";
import { useAdminData } from "@/hooks/use-admin-data";

export default function UsersManagement() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [editLoading, setEditLoading] = useState(false);
  const [refreshTrigger] = useState(0);

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
    setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: true }));
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
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: false }));
    }
  };

  const handleToggleUserStatus = async (
    userId: string,
    newStatus: "active" | "inactive"
  ) => {
    setActionLoading((prev) => ({ ...prev, [`toggle-${userId}`]: true }));
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
    } finally {
      setActionLoading((prev) => ({ ...prev, [`toggle-${userId}`]: false }));
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
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-2">
            <div className="flex flex-col justify-center items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Active Users
              </p>
              <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-2">
            <div className="flex flex-col justify-center items-center gap-2">
              <UserX className="h-5 w-5 text-red-600" />
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Inactive Users
              </p>
              <p className="text-xl sm:text-2xl font-bold">{stats.inactive}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-2">
            <div className="flex flex-col justify-center items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Verified Emails
              </p>
              <p className="text-xl sm:text-2xl font-bold">
                {stats.verifiedEmails}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-2">
            <div className="flex flex-col justify-center items-center gap-2">
              <Phone className="h-5 w-5 text-purple-600" />
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Verified Phones
              </p>
              <p className="text-xl sm:text-2xl font-bold">
                {stats.verifiedPhones}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({stats.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            onRefresh={handleRefresh}
            onView={(user) => {
              setSelectedUser(user);
              setViewDialogOpen(true);
            }}
            onEdit={(user) => {
              setSelectedUser(user);
              setEditDialogOpen(true);
            }}
            onToggleStatus={handleToggleUserStatus}
            onDelete={handleDeleteUser}
            isLoading={loading}
            actionLoading={actionLoading}
          />
        </CardContent>
      </Card>

      {selectedUser && (
        <>
          <UserViewDialog
            user={selectedUser}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
          <UserEditDialog
            user={selectedUser}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
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
