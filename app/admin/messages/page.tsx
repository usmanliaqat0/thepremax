"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, RefreshCw } from "lucide-react";
import MessageTable from "@/components/admin/MessageTable";
import { toast } from "sonner";
import { useAdminData } from "@/hooks/use-admin-data";

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

  // Use the new hook for fetching all messages
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
      } else {
        toast.error(data.error || "Failed to update message status");
      }
    } catch (error) {
      console.error("Error updating message status:", error);
      toast.error("Failed to update message status");
    }
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
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              New Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {statusCounts.new}
            </div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Read
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-600">
              {statusCounts.read}
            </div>
            <p className="text-xs text-muted-foreground">Read messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Replied
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {statusCounts.replied}
            </div>
            <p className="text-xs text-muted-foreground">Replied messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Closed
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {statusCounts.closed}
            </div>
            <p className="text-xs text-muted-foreground">Closed messages</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageTable
            messages={messages}
            onRefresh={handleRefresh}
            onStatusUpdate={handleStatusUpdate}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
