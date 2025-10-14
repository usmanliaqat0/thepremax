"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format } from "date-fns";

interface PromoCode {
  _id?: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

interface PromoCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promoCode?: PromoCode | null;
  onSuccess: () => void;
}

export default function PromoCodeDialog({
  open,
  onOpenChange,
  promoCode,
  onSuccess,
}: PromoCodeDialogProps) {
  const [formData, setFormData] = useState<PromoCode>({
    code: "",
    description: "",
    type: "percentage",
    value: 0,
    minimumAmount: 0,
    maximumDiscount: 0,
    usageLimit: 0,
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (promoCode) {
      setFormData({
        ...promoCode,
        validFrom: promoCode.validFrom
          ? format(new Date(promoCode.validFrom), "yyyy-MM-dd'T'HH:mm")
          : "",
        validUntil: promoCode.validUntil
          ? format(new Date(promoCode.validUntil), "yyyy-MM-dd'T'HH:mm")
          : "",
      });
    } else {
      setFormData({
        code: "",
        description: "",
        type: "percentage",
        value: 0,
        minimumAmount: 0,
        maximumDiscount: 0,
        usageLimit: 0,
        validFrom: "",
        validUntil: "",
        isActive: true,
      });
    }
  }, [promoCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = promoCode
        ? `/api/admin/promo-codes/${promoCode._id}`
        : "/api/admin/promo-codes";
      const method = promoCode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          promoCode
            ? "Promo code updated successfully"
            : "Promo code created successfully"
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(data.error || "Failed to save promo code");
      }
    } catch (error) {
      console.error("Error saving promo code:", error);
      toast.error("Failed to save promo code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {promoCode ? "Edit Promo Code" : "Create Promo Code"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g., WELCOME10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "percentage" | "fixed") =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Optional description for this promo code"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">
                {formData.type === "percentage"
                  ? "Percentage (%)"
                  : "Fixed Amount ($)"}{" "}
                *
              </Label>
              <Input
                id="value"
                type="number"
                min="0"
                max={formData.type === "percentage" ? "100" : undefined}
                step={formData.type === "percentage" ? "0.01" : "0.01"}
                value={formData.value}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    value: parseFloat(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumAmount">Minimum Order Amount ($)</Label>
              <Input
                id="minimumAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.minimumAmount || 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minimumAmount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          {formData.type === "percentage" && (
            <div className="space-y-2">
              <Label htmlFor="maximumDiscount">Maximum Discount ($)</Label>
              <Input
                id="maximumDiscount"
                type="number"
                min="0"
                step="0.01"
                value={formData.maximumDiscount || 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maximumDiscount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage Limit</Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit || 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  usageLimit: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From *</Label>
              <Input
                id="validFrom"
                type="datetime-local"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    validFrom: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until *</Label>
              <Input
                id="validUntil"
                type="datetime-local"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    validUntil: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : promoCode ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
