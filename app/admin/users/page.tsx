"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  Eye,
} from "lucide-react";
import { User } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import UserEditDialog from "@/components/admin/UserEditDialog";
import UserViewDialog from "@/components/admin/UserViewDialog";
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshLoading(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/admin/users?limit=1000");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        if (isRefresh) {
          showSuccessMessage("Users refreshed successfully");
        }
      } else {
        setUsers([]);
        showErrorMessage("Failed to fetch users");
      }
    } catch (error) {
      setUsers([]);
      console.error("Error fetching users:", error);
      showErrorMessage("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "admin" ? "destructive" : "outline"}>
        {role}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, permissions, and settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchUsers(true)}
            disabled={refreshLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshLoading ? "animate-spin" : ""}`}
            />
            {refreshLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Inactive Users</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.status === "inactive").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Verified Emails</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.isEmailVerified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Verified Phones</p>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.isPhoneVerified).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(
                    e.target.value as "all" | "active" | "inactive"
                  )
                }
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            {user.isEmailVerified && (
                              <Badge variant="outline" className="text-xs">
                                Email ✓
                              </Badge>
                            )}
                            {user.isPhoneVerified && (
                              <Badge variant="outline" className="text-xs">
                                Phone ✓
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {user.phone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleToggleUserStatus(
                              user.id,
                              user.status === "active" ? "inactive" : "active"
                            )
                          }
                          disabled={actionLoading[`toggle-${user.id}`]}
                        >
                          {actionLoading[`toggle-${user.id}`] ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : user.status === "active" ? (
                            <UserX className="h-4 w-4 text-red-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={actionLoading[`delete-${user.id}`]}
                            >
                              {actionLoading[`delete-${user.id}`] ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-600" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.firstName}{" "}
                                {user.lastName}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={actionLoading[`delete-${user.id}`]}
                              >
                                {actionLoading[`delete-${user.id}`] ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
