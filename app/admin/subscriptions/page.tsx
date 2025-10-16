"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MailCheck,
  MailX,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AdminDataTable,
  TableColumn,
  TableAction,
} from "@/components/admin/AdminDataTable";

interface EmailSubscription extends Record<string, unknown> {
  _id: string;
  email: string;
  source: string;
  status: "active" | "unsubscribed" | "bounced";
  subscribedAt: string;
  unsubscribedAt?: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
  };
}

interface SubscriptionStats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
}

interface SourceStats {
  _id: string;
  count: number;
}

export default function AdminSubscriptions() {
  const [allSubscriptions, setAllSubscriptions] = useState<EmailSubscription[]>(
    []
  );
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    unsubscribed: 0,
    bounced: 0,
  });
  const [sourceStats, setSourceStats] = useState<SourceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");

  const fetchAllSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/subscriptions?limit=10000"); // Get all data
      const data = await response.json();

      if (response.ok) {
        setAllSubscriptions(data.subscriptions);
        setStats(data.stats);
        setSourceStats(data.sourceStats);
      } else {
        toast.error(data.message || "Failed to fetch subscriptions");
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSubscriptions();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Subscription status updated successfully");

        setAllSubscriptions((prev) =>
          prev.map((sub) =>
            sub._id === id
              ? {
                  ...sub,
                  status: newStatus as "active" | "unsubscribed" | "bounced",
                  unsubscribedAt:
                    newStatus === "unsubscribed"
                      ? new Date().toISOString()
                      : undefined,
                }
              : sub
          )
        );
        const updatedSubs = allSubscriptions.map((sub) =>
          sub._id === id
            ? {
                ...sub,
                status: newStatus as "active" | "unsubscribed" | "bounced",
                unsubscribedAt:
                  newStatus === "unsubscribed"
                    ? new Date().toISOString()
                    : undefined,
              }
            : sub
        );

        const newStats = {
          total: updatedSubs.length,
          active: updatedSubs.filter((s) => s.status === "active").length,
          unsubscribed: updatedSubs.filter((s) => s.status === "unsubscribed")
            .length,
          bounced: updatedSubs.filter((s) => s.status === "bounced").length,
        };
        setStats(newStats);
      } else {
        toast.error(data.message || "Failed to update subscription");
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Subscription deleted successfully");

        // Update the local data instead of refetching
        setAllSubscriptions((prev) => prev.filter((sub) => sub._id !== id));

        // Recalculate stats
        const updatedSubs = allSubscriptions.filter((sub) => sub._id !== id);
        const newStats = {
          total: updatedSubs.length,
          active: updatedSubs.filter((s) => s.status === "active").length,
          unsubscribed: updatedSubs.filter((s) => s.status === "unsubscribed")
            .length,
          bounced: updatedSubs.filter((s) => s.status === "bounced").length,
        };
        setStats(newStats);
      } else {
        toast.error(data.message || "Failed to delete subscription");
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <MailCheck className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "unsubscribed":
        return (
          <Badge variant="secondary">
            <MailX className="w-3 h-3 mr-1" />
            Unsubscribed
          </Badge>
        );
      case "bounced":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Bounced
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      footer: "bg-blue-100 text-blue-800",
      newsletter: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge
        variant="outline"
        className={colors[source as keyof typeof colors] || colors.other}
      >
        {source.charAt(0).toUpperCase() + source.slice(1)}
      </Badge>
    );
  };

  const columns: TableColumn<EmailSubscription>[] = [
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "source",
      label: "Source",
      render: (item) => getSourceBadge(item.source),
    },
    {
      key: "subscribedAt",
      label: "Subscribed",
      render: (item) => format(new Date(item.subscribedAt), "MMM dd, yyyy"),
      sortable: true,
    },
  ];

  const getActions = (
    item: EmailSubscription
  ): TableAction<EmailSubscription>[] => {
    const actions: TableAction<EmailSubscription>[] = [];
    if (item.status !== "active") {
      actions.push({
        label: "Mark as Active",
        icon: <MailCheck className="h-4 w-4 mr-2" />,
        onClick: (item) => handleStatusChange(item._id, "active"),
      });
    }

    if (item.status !== "unsubscribed") {
      actions.push({
        label: "Mark as Unsubscribed",
        icon: <MailX className="h-4 w-4 mr-2" />,
        onClick: (item) => handleStatusChange(item._id, "unsubscribed"),
      });
    }

    if (item.status !== "bounced") {
      actions.push({
        label: "Mark as Bounced",
        icon: <AlertTriangle className="h-4 w-4 mr-2" />,
        onClick: (item) => handleStatusChange(item._id, "bounced"),
      });
    }

    actions.push({
      label: "Delete",
      icon: <AlertTriangle className="h-4 w-4 mr-2" />,
      onClick: (item) => handleDelete(item._id),
      variant: "destructive",
      confirm: {
        title: "Delete Subscription",
        description:
          "Are you sure you want to delete this subscription? This action cannot be undone.",
      },
    });

    return actions;
  };

  const statusFilterOptions = [
    { key: "all", label: "All Status", value: "all" },
    { key: "active", label: "Active", value: "active" },
    { key: "unsubscribed", label: "Unsubscribed", value: "unsubscribed" },
    { key: "bounced", label: "Bounced", value: "bounced" },
  ];

  const sourceFilterOptions = [
    { key: "all", label: "All Sources", value: "all" },
    { key: "footer", label: "Footer", value: "footer" },
    { key: "newsletter", label: "Newsletter", value: "newsletter" },
    { key: "other", label: "Other", value: "other" },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Email Subscriptions
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage newsletter subscriptions and track engagement
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        <Card className="p-2 sm:p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Total Subscribers
              </p>
              <p className="text-base sm:text-lg font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <MailCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Active
              </p>
              <p className="text-base sm:text-lg font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <MailX className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Unsubscribed
              </p>
              <p className="text-base sm:text-lg font-bold">
                {stats.unsubscribed}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Bounced
              </p>
              <p className="text-base sm:text-lg font-bold">{stats.bounced}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Source Stats */}
      {sourceStats.length > 0 && (
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Subscriptions by Source
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {sourceStats.map((stat) => (
                <div key={stat._id} className="text-center">
                  <p className="text-xl sm:text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                    {stat._id}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Data Table */}
      <AdminDataTable
        title="Email Subscriptions"
        data={allSubscriptions}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search by email..."
        searchKey="email"
        filters={[
          {
            key: "status",
            label: "Filter by status",
            options: statusFilterOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
          {
            key: "source",
            label: "Filter by source",
            options: sourceFilterOptions,
            value: sourceFilter,
            onChange: setSourceFilter,
          },
        ]}
        actions={getActions}
        onRefresh={fetchAllSubscriptions}
        emptyMessage="No subscriptions found"
        emptyIcon={<Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        itemsPerPage={10}
        showPagination={true}
      />
    </div>
  );
}
