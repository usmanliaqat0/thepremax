"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye, Trash2, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import AdminTable, {
  TableColumn,
  FilterOption,
  ActionItem,
} from "./AdminTable";

interface ContactMessage {
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

interface MessageTableProps {
  messages: ContactMessage[];
  onRefresh: () => void;
  onSearch: (search: string) => void;
  onStatusFilter: (status: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function MessageTable({
  messages,
  onRefresh,
  onSearch,
  onStatusFilter,
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: MessageTableProps) {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
  };

  const handleDelete = async (message: ContactMessage) => {
    try {
      const response = await fetch(`/api/admin/messages/${message._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Message deleted successfully");
        onRefresh();
      } else {
        toast.error(data.error || "Failed to delete message");
      }
    } catch (error) {
      console.error("Delete message error:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleStatusUpdate = async (messageId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Message status updated");
        onRefresh();
      } else {
        toast.error(data.error || "Failed to update message status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      toast.error("Failed to update message status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { variant: "default" as const, label: "New" },
      read: { variant: "secondary" as const, label: "Read" },
      replied: { variant: "outline" as const, label: "Replied" },
      closed: { variant: "destructive" as const, label: "Closed" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: TableColumn<ContactMessage>[] = [
    {
      key: "name",
      header: "Name",
      render: (message) => <div className="font-medium">{message.name}</div>,
    },
    {
      key: "email",
      header: "Email",
      render: (message) => message.email,
    },
    {
      key: "subject",
      header: "Subject",
      render: (message) => (
        <div className="max-w-xs truncate">
          {message.subject || "No subject"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (message) => getStatusBadge(message.status),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (message) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
          })}
        </span>
      ),
    },
  ];

  const filters: FilterOption[] = [
    {
      key: "status",
      label: "Status",
      value: "all",
      options: [
        { value: "new", label: "New" },
        { value: "read", label: "Read" },
        { value: "replied", label: "Replied" },
        { value: "closed", label: "Closed" },
      ],
    },
  ];

  const actions: ActionItem<ContactMessage>[] = [
    {
      key: "view",
      label: "View",
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: handleViewMessage,
    },
    {
      key: "reply",
      label: (message) =>
        message.status === "replied" ? "Already Replied" : "Mark as Replied",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      onClick: (message) => handleStatusUpdate(message._id, "replied"),
      disabled: (message) => message.status === "replied" || isUpdating,
    },
    {
      key: "close",
      label: (message) =>
        message.status === "closed" ? "Already Closed" : "Close",
      icon: <X className="mr-2 h-4 w-4" />,
      onClick: (message) => handleStatusUpdate(message._id, "closed"),
      disabled: (message) => message.status === "closed" || isUpdating,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: () => {},
      variant: "destructive",
    },
  ];

  return (
    <>
      <AdminTable
        data={messages}
        columns={columns}
        actions={actions}
        filters={filters}
        searchPlaceholder="Search messages..."
        emptyMessage="No messages found"
        isLoading={loading}
        onSearch={onSearch}
        onFilter={(key, value) => {
          if (key === "status") onStatusFilter(value);
        }}
        onDelete={handleDelete}
        deleteTitle="Delete Message"
        deleteDescription={() =>
          "Are you sure you want to delete this message? This action cannot be undone."
        }
        pagination={{
          currentPage,
          totalPages,
          onPageChange,
        }}
      />

      {}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Message</DialogTitle>
            <DialogDescription>
              Message from {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  {getStatusBadge(selectedMessage.status)}
                </div>
              </div>
              {selectedMessage.subject && (
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <p className="mt-1 text-sm">{selectedMessage.subject}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
              {selectedMessage.adminNotes && (
                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {selectedMessage.adminNotes}
                  </p>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                <p>
                  Created:{" "}
                  {formatDistanceToNow(new Date(selectedMessage.createdAt), {
                    addSuffix: true,
                  })}
                </p>
                {selectedMessage.repliedAt && (
                  <p>
                    Replied:{" "}
                    {formatDistanceToNow(new Date(selectedMessage.repliedAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
                {selectedMessage.closedAt && (
                  <p>
                    Closed:{" "}
                    {formatDistanceToNow(new Date(selectedMessage.closedAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
