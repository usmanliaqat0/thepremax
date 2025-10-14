"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Tag,
  Eye,
  Edit,
  Trash2,
  Percent,
  DollarSign,
} from "lucide-react";
import PromoCodeDialog from "@/components/admin/PromoCodeDialog";
import PromoCodeViewDialog from "@/components/admin/PromoCodeViewDialog";
import { toast } from "sonner";
import { useAdminData } from "@/hooks/use-admin-data";
import { useDialog } from "@/hooks/use-dialog";
import {
  AdminDataTable,
  TableColumn,
  TableAction,
} from "@/components/admin/AdminDataTable";
import { format } from "date-fns";

interface PromoCode extends Record<string, unknown> {
  _id: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PromoCodesPage() {
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(
    null
  );
  const [viewingPromoCode, setViewingPromoCode] = useState<PromoCode | null>(
    null
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const editDialog = useDialog({
    onOpenChange: (open) => {
      if (!open) {
        setEditingPromoCode(null);
      }
    },
  });

  const viewDialog = useDialog({
    onOpenChange: (open) => {
      if (!open) {
        setViewingPromoCode(null);
      }
    },
  });

  const {
    data: promoCodes,
    isLoading,
    error,
    refresh,
    setData,
  } = useAdminData<PromoCode>({
    endpoint: "/api/admin/promo-codes",
    refreshTrigger,
  });

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    toast.success("Promo code saved successfully");
  };

  const handleDelete = async (promoCode: PromoCode) => {
    try {
      const response = await fetch(`/api/admin/promo-codes/${promoCode._id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setData(promoCodes.filter((p) => p._id !== promoCode._id));
        toast.success("Promo code deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete promo code");
      }
    } catch (error) {
      console.error("Error deleting promo code:", error);
      toast.error("Failed to delete promo code");
    }
  };

  const handleRefresh = () => {
    refresh();
    toast.success("Promo codes refreshed");
  };

  const getStatusInfo = (promoCode: PromoCode) => {
    const now = new Date();
    const validFrom = new Date(promoCode.validFrom);
    const validUntil = new Date(promoCode.validUntil);

    if (!promoCode.isActive) {
      return { text: "Inactive", color: "bg-gray-100 text-gray-800" };
    }
    if (validFrom > now) {
      return { text: "Upcoming", color: "bg-blue-100 text-blue-800" };
    }
    if (validUntil < now) {
      return { text: "Expired", color: "bg-red-100 text-red-800" };
    }
    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return { text: "Limit Reached", color: "bg-orange-100 text-orange-800" };
    }
    return { text: "Active", color: "bg-green-100 text-green-800" };
  };

  const getStatusBadge = (promoCode: PromoCode) => {
    const statusInfo = getStatusInfo(promoCode);
    return (
      <Badge variant="outline" className={statusInfo.color}>
        {statusInfo.text}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      percentage: "bg-blue-100 text-blue-800",
      fixed: "bg-green-100 text-green-800",
    };
    return (
      <Badge
        variant="outline"
        className={colors[type as keyof typeof colors] || "bg-gray-100"}
      >
        {type === "percentage" ? (
          <Percent className="h-3 w-3 mr-1" />
        ) : (
          <DollarSign className="h-3 w-3 mr-1" />
        )}
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter((p) => {
      const now = new Date();
      const validFrom = new Date(p.validFrom);
      const validUntil = new Date(p.validUntil);
      return (
        p.isActive &&
        validFrom <= now &&
        validUntil >= now &&
        (!p.usageLimit || p.usedCount < p.usageLimit)
      );
    }).length,
    expired: promoCodes.filter((p) => {
      const now = new Date();
      const validUntil = new Date(p.validUntil);
      return validUntil < now;
    }).length,
    percentage: promoCodes.filter((p) => p.type === "percentage").length,
    fixed: promoCodes.filter((p) => p.type === "fixed").length,
  };

  const columns: TableColumn<PromoCode>[] = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (item) => (
        <div className="font-mono font-semibold">{item.code}</div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (item) => getTypeBadge(item.type),
    },
    {
      key: "value",
      label: "Value",
      render: (item) => (
        <div className="font-semibold">
          {item.type === "percentage" ? `${item.value}%` : `$${item.value}`}
        </div>
      ),
    },
    {
      key: "usedCount",
      label: "Usage",
      render: (item) => (
        <div className="text-sm">
          {item.usedCount}
          {item.usageLimit && ` / ${item.usageLimit}`}
        </div>
      ),
    },
    {
      key: "validUntil",
      label: "Expires",
      render: (item) => format(new Date(item.validUntil), "MMM dd, yyyy"),
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => getStatusBadge(item),
    },
  ];

  const getActions = (): TableAction<PromoCode>[] => {
    const actions: TableAction<PromoCode>[] = [];

    actions.push({
      label: "View",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (promoCode) => {
        setViewingPromoCode(promoCode);
        viewDialog.openDialog();
      },
    });

    actions.push({
      label: "Edit",
      icon: <Edit className="h-4 w-4 mr-2" />,
      onClick: (promoCode) => {
        setEditingPromoCode(promoCode);
        editDialog.openDialog();
      },
    });

    actions.push({
      label: "Delete",
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: (promoCode) => handleDelete(promoCode),
      variant: "destructive",
      confirm: {
        title: "Delete Promo Code",
        description:
          "Are you sure you want to delete this promo code? This action cannot be undone.",
      },
    });

    return actions;
  };

  const statusFilterOptions = [
    { key: "all", label: "All Status", value: "all" },
    { key: "active", label: "Active", value: "active" },
    { key: "inactive", label: "Inactive", value: "inactive" },
    { key: "expired", label: "Expired", value: "expired" },
    { key: "upcoming", label: "Upcoming", value: "upcoming" },
  ];

  const typeFilterOptions = [
    { key: "all", label: "All Types", value: "all" },
    { key: "percentage", label: "Percentage", value: "percentage" },
    { key: "fixed", label: "Fixed Amount", value: "fixed" },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Promo Codes</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Error loading promo codes: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Promo Codes
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage discount codes and promotional offers
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <Tag className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={editDialog.openDialog} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Promo Code
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Promo Codes
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All codes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Expired Codes</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">No longer valid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Percentage Codes
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.percentage}</div>
            <p className="text-xs text-muted-foreground">Percentage based</p>
          </CardContent>
        </Card>
      </div>

      <AdminDataTable
        title="Promo Codes"
        data={promoCodes}
        columns={columns}
        loading={isLoading}
        searchable={true}
        searchPlaceholder="Search by code or description..."
        searchKey="code"
        filters={[
          {
            key: "status",
            label: "Filter by status",
            options: statusFilterOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
          {
            key: "type",
            label: "Filter by type",
            options: typeFilterOptions,
            value: typeFilter,
            onChange: setTypeFilter,
          },
        ]}
        actions={getActions}
        onRefresh={handleRefresh}
        emptyMessage="No promo codes found"
        emptyIcon={<Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        itemsPerPage={10}
        showPagination={true}
      />

      <PromoCodeDialog
        open={editDialog.open}
        onOpenChange={editDialog.onOpenChange}
        promoCode={editingPromoCode}
        onSuccess={handleSuccess}
      />

      <PromoCodeViewDialog
        open={viewDialog.open}
        onOpenChange={viewDialog.onOpenChange}
        promoCode={viewingPromoCode}
      />
    </div>
  );
}
