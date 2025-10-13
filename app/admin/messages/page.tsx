"use client";

import { useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshLoader } from "@/components/ui/loader";
import {
  MessageSquare,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminData } from "@/hooks/use-admin-data";
import {
  AdminDataTable,
  TableColumn,
  TableAction,
} from "@/components/admin/AdminDataTable";
import MessageViewDialog from "@/components/admin/MessageViewDialog";
import { format } from "date-fns";

interface ContactMessage extends Record<string, unknown> {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  adminNotes?: string;
  repliedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MessagesPage() {
  const [refreshTrigger] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const {
    data: messages,
    isLoading: loading,
    error,
    refresh,
    setData,
  } = useAdminData<ContactMessage>({
    endpoint: "/api/admin/messages",
    refreshTrigger,
  });

  const handleRefresh = () => {
    refresh();
    toast.success("Messages refreshed");
  };

  const handleStatusUpdate = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setData(
          messages.map((msg) =>
            msg._id === messageId
              ? { ...msg, status: newStatus as ContactMessage["status"] }
              : msg
          )
        );
        toast.success("Message status updated");

        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage({
            ...selectedMessage,
            status: newStatus as ContactMessage["status"],
          });
        }
      } else {
        toast.error(data.error || "Failed to update message status");
      }
    } catch (error) {
      console.error("Error updating message status:", error);
      toast.error("Failed to update message status");
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
  };

  const getStatusCounts = () => {
    const counts = {
      new: 0,
      read: 0,
      replied: 0,
      closed: 0,
    };

    messages.forEach((message) => {
      counts[message.status]++;
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const getStatusBadge = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      read: "bg-gray-100 text-gray-800",
      replied: "bg-green-100 text-green-800",
      closed: "bg-red-100 text-red-800",
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

  const columns: TableColumn<ContactMessage>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "subject",
      label: "Subject",
      render: (item) => item.subject || "No Subject",
    },
    {
      key: "status",
      label: "Status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "createdAt",
      label: "Received",
      render: (item) => format(new Date(item.createdAt), "MMM dd, yyyy"),
      sortable: true,
    },
  ];

  const getActions = (item: ContactMessage): TableAction<ContactMessage>[] => {
    const actions: TableAction<ContactMessage>[] = [];

    actions.push({
      label: "View",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (message) => handleViewMessage(message),
    });

    if (item.status !== "read") {
      actions.push({
        label: "Mark as Read",
        icon: <CheckCircle className="h-4 w-4 mr-2" />,
        onClick: (message) => handleStatusUpdate(message._id, "read"),
      });
    }

    if (item.status !== "replied") {
      actions.push({
        label: "Mark as Replied",
        icon: <CheckCircle className="h-4 w-4 mr-2" />,
        onClick: (message) => handleStatusUpdate(message._id, "replied"),
      });
    }

    if (item.status !== "closed") {
      actions.push({
        label: "Close",
        icon: <XCircle className="h-4 w-4 mr-2" />,
        onClick: (message) => handleStatusUpdate(message._id, "closed"),
      });
    }

    return actions;
  };

  const statusFilterOptions = [
    { key: "all", label: "All Status", value: "all" },
    { key: "new", label: "New", value: "new" },
    { key: "read", label: "Read", value: "read" },
    { key: "replied", label: "Replied", value: "replied" },
    { key: "closed", label: "Closed", value: "closed" },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contact Messages</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Error loading messages: {error}
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
            Contact Messages
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage customer inquiries and support messages
          </p>
        </div>
        <Button
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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        <Card className="p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              New Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="text-base sm:text-lg font-bold text-blue-600">
              {statusCounts.new}
            </div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </div>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Read
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="text-base sm:text-lg font-bold text-gray-600">
              {statusCounts.read}
            </div>
            <p className="text-xs text-muted-foreground">Read messages</p>
          </div>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Replied
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="text-base sm:text-lg font-bold text-green-600">
              {statusCounts.replied}
            </div>
            <p className="text-xs text-muted-foreground">Replied messages</p>
          </div>
        </Card>

        <Card className="p-2 sm:p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Closed
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <div className="text-base sm:text-lg font-bold text-red-600">
              {statusCounts.closed}
            </div>
            <p className="text-xs text-muted-foreground">Closed messages</p>
          </div>
        </Card>
      </div>

      {/* Messages Data Table */}
      <AdminDataTable
        title="Contact Messages"
        data={messages}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search by name or email..."
        searchKey="name"
        filters={[
          {
            key: "status",
            label: "Filter by status",
            options: statusFilterOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
        actions={getActions}
        onRefresh={handleRefresh}
        emptyMessage="No messages found"
        emptyIcon={
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        }
        itemsPerPage={10}
        showPagination={true}
      />

      {/* Message View Dialog */}
      <MessageViewDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        message={selectedMessage}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
