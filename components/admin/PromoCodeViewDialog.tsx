"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
  Calendar,
  DollarSign,
  Percent,
  Users,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface PromoCode {
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

interface PromoCodeViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promoCode?: PromoCode | null;
}

export default function PromoCodeViewDialog({
  open,
  onOpenChange,
  promoCode,
}: PromoCodeViewDialogProps) {
  if (!promoCode) return null;

  const now = new Date();
  const validFrom = new Date(promoCode.validFrom);
  const validUntil = new Date(promoCode.validUntil);

  // const isCurrentlyValid =
  //   promoCode.isActive &&
  //   validFrom <= now &&
  //   validUntil >= now &&
  //   (!promoCode.usageLimit || promoCode.usedCount < promoCode.usageLimit);

  const getStatusInfo = () => {
    if (!promoCode.isActive) {
      return {
        text: "Inactive",
        color: "bg-gray-100 text-gray-800",
        icon: XCircle,
      };
    }
    if (validFrom > now) {
      return {
        text: "Upcoming",
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
      };
    }
    if (validUntil < now) {
      return {
        text: "Expired",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      };
    }
    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return {
        text: "Usage Limit Reached",
        color: "bg-orange-100 text-orange-800",
        icon: XCircle,
      };
    }
    return {
      text: "Active",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Promo Code Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{promoCode.code}</h3>
              {promoCode.description && (
                <p className="text-muted-foreground mt-1">
                  {promoCode.description}
                </p>
              )}
            </div>
            <Badge className={statusInfo.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.text}
            </Badge>
          </div>

          {/* Discount Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {promoCode.type === "percentage" ? (
                  <Percent className="h-5 w-5" />
                ) : (
                  <DollarSign className="h-5 w-5" />
                )}
                Discount Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Type
                  </p>
                  <p className="text-lg font-semibold capitalize">
                    {promoCode.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Value
                  </p>
                  <p className="text-lg font-semibold">
                    {promoCode.type === "percentage"
                      ? `${promoCode.value}%`
                      : `$${promoCode.value}`}
                  </p>
                </div>
              </div>

              {promoCode.minimumAmount && promoCode.minimumAmount > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Minimum Order Amount
                  </p>
                  <p className="text-lg font-semibold">
                    ${promoCode.minimumAmount}
                  </p>
                </div>
              )}

              {promoCode.maximumDiscount && promoCode.maximumDiscount > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Maximum Discount
                  </p>
                  <p className="text-lg font-semibold">
                    ${promoCode.maximumDiscount}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usage Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Used Count
                  </p>
                  <p className="text-lg font-semibold">{promoCode.usedCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Usage Limit
                  </p>
                  <p className="text-lg font-semibold">
                    {promoCode.usageLimit ? promoCode.usageLimit : "Unlimited"}
                  </p>
                </div>
              </div>

              {promoCode.usageLimit && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Remaining Usage
                  </p>
                  <p className="text-lg font-semibold">
                    {Math.max(0, promoCode.usageLimit - promoCode.usedCount)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validity Period */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Validity Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Valid From
                  </p>
                  <p className="text-lg font-semibold">
                    {format(validFrom, "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Valid Until
                  </p>
                  <p className="text-lg font-semibold">
                    {format(validUntil, "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Created
                </span>
                <span className="text-sm">
                  {format(
                    new Date(promoCode.createdAt),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </span>
                <span className="text-sm">
                  {format(
                    new Date(promoCode.updatedAt),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
