"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Mail,
  User,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
} from "lucide-react";

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

interface MessageViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: ContactMessage | null;
  onStatusUpdate?: (messageId: string, newStatus: string) => void;
}

export default function MessageViewDialog({
  open,
  onOpenChange,
  message,
  onStatusUpdate,
}: MessageViewDialogProps) {
  if (!message) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-gray-100 text-gray-800";
      case "replied":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <MessageSquare className="h-4 w-4" />;
      case "read":
        return <CheckCircle className="h-4 w-4" />;
      case "replied":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(message._id, newStatus);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Message Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(message.status)}>
                {getStatusIcon(message.status)}
                <span className="ml-1 capitalize">{message.status}</span>
              </Badge>
            </div>

            <div className="flex gap-2">
              {message.status !== "read" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate("read")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Read
                </Button>
              )}
              {message.status !== "replied" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate("replied")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark as Replied
                </Button>
              )}
              {message.status !== "closed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate("closed")}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Close
                </Button>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Name
                </label>
                <p className="text-sm font-medium mt-1">{message.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-sm font-medium mt-1">{message.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Received
                </label>
                <p className="text-sm font-medium mt-1">
                  {format(
                    new Date(message.createdAt),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </p>
              </div>

              {message.updatedAt !== message.createdAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Last Updated
                  </label>
                  <p className="text-sm font-medium mt-1">
                    {format(
                      new Date(message.updatedAt),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
              )}
            </div>

            {message.subject && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Subject
                </label>
                <p className="text-sm font-medium mt-1">{message.subject}</p>
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Message Content</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
            </div>
          </div>

          {/* Admin Notes */}
          {message.adminNotes && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Admin Notes</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {message.adminNotes}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Message received:</span>
                <span className="font-medium">
                  {format(
                    new Date(message.createdAt),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>

              {message.repliedAt && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Replied:</span>
                  <span className="font-medium">
                    {format(
                      new Date(message.repliedAt),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
              )}

              {message.closedAt && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Closed:</span>
                  <span className="font-medium">
                    {format(
                      new Date(message.closedAt),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
