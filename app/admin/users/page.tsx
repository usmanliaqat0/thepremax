"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });

  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshLoading(true);
      } else {
        setLoading(true);
      }
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageLimit.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(filterStatus &&
            filterStatus !== "all" && { status: filterStatus }),
        });

        const res = await fetch(`/api/admin/users?${params}`);
        const data = await res.json();
        if (data.success) {
          setUsers(data.data.users || []);
          setPagination(
            data.pagination || {
              total: 0,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false,
            }
          );
          if (isRefresh) {
            showSuccessMessage("Users refreshed successfully");
          }
        } else {
          setUsers([]);
          setPagination({
            total: 0,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
          });
          showErrorMessage("Failed to fetch users");
        }
      } catch (error) {
        setUsers([]);
        setPagination({
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        });
        console.error("Error fetching users:", error);
        showErrorMessage("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
        setRefreshLoading(false);
      }
    },
    [currentPage, pageLimit, searchTerm, filterStatus]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId: string) => {
    setActionLoading((prev) => ({ ...prev, [`delete-${userId}`]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(users.filter((user) => user.id !== userId));
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
        setUsers(
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status as "all" | "active" | "inactive");
    setCurrentPage(1); // Reset to first page when filtering
  };

  const filteredUsers = users; // No need for client-side filtering since we're using server-side pagination

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, permissions, and settings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => fetchUsers(true)}
            disabled={refreshLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshLoading ? "animate-spin" : ""}`}
            />
            {refreshLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-2">
            <div className="flex flex-col justify-center items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Active Users
              </p>
              <p className="text-xl sm:text-2xl font-bold">
                {users.filter((u) => u.status === "active").length}
              </p>
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
              <p className="text-xl sm:text-2xl font-bold">
                {users.filter((u) => u.status === "inactive").length}
              </p>
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
                {users.filter((u) => u.isEmailVerified).length}
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
                {users.filter((u) => u.isPhoneVerified).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            users={filteredUsers}
            onRefresh={() => fetchUsers(true)}
            onSearch={handleSearch}
            onStatusFilter={handleStatusFilter}
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
            searchTerm={searchTerm}
            statusFilter={filterStatus}
            isLoading={loading}
            actionLoading={actionLoading}
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
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
              // Update user in DB
              setEditLoading(true);
              try {
                const res = await fetch(`/api/admin/users/${updatedUser.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updatedUser),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setUsers(
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
