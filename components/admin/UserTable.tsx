"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import {
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import AdminTable, {
  TableColumn,
  FilterOption,
  ActionItem,
} from "./AdminTable";

interface UserTableProps {
  users: User[];
  onRefresh: () => void;
  onSearch: (search: string) => void;
  onStatusFilter: (status: string) => void;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onToggleStatus: (userId: string, newStatus: "active" | "inactive") => void;
  onDelete: (userId: string) => void;
  searchTerm: string;
  statusFilter: string;
  isLoading: boolean;
  actionLoading: { [key: string]: boolean };
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function UserTable({
  users,
  onSearch,
  onStatusFilter,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  searchTerm,
  statusFilter,
  isLoading,
  actionLoading,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: UserTableProps) {
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

  const columns: TableColumn<User>[] = [
    {
      key: "user",
      header: "User",
      render: (user) => (
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
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => (
        <div className="flex items-center gap-1">
          <Mail className="h-3 w-3 text-muted-foreground" />
          {user.email}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (user) =>
        user.phone ? (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {user.phone}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => getStatusBadge(user.status),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => getRoleBadge(user.role),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (user) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {formatDistanceToNow(new Date(user.createdAt), {
            addSuffix: true,
          })}
        </div>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      value: statusFilter,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  const actions: ActionItem<User>[] = [
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
      key: "toggle",
      label: (user) => (user.status === "active" ? "Deactivate" : "Activate"),
      icon: (user) =>
        user.status === "active" ? (
          <UserX className="mr-2 h-4 w-4" />
        ) : (
          <UserCheck className="mr-2 h-4 w-4" />
        ),
      onClick: (user) =>
        onToggleStatus(
          user.id,
          user.status === "active" ? "inactive" : "active"
        ),
      disabled: (user) => actionLoading[`toggle-${user.id}`],
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: (user) => onDelete(user.id),
      variant: "destructive",
      disabled: (user) => actionLoading[`delete-${user.id}`],
    },
  ];

  return (
    <AdminTable
      data={users}
      columns={columns}
      actions={actions}
      filters={filters}
      searchPlaceholder="Search users by name or email..."
      emptyMessage="No users found"
      isLoading={isLoading}
      onSearch={onSearch}
      onFilter={(key, value) => {
        if (key === "status") onStatusFilter(value);
      }}
      searchValue={searchTerm}
      filterValues={{ status: statusFilter }}
      pagination={
        onPageChange
          ? {
              currentPage,
              totalPages,
              onPageChange,
            }
          : undefined
      }
    />
  );
}
