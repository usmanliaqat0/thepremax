"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshLoader } from "@/components/ui/loader";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  User,
  CreditCard,
} from "lucide-react";
import { useDialog } from "@/hooks/use-dialog";
import {
  AdminDataTable,
  TableColumn,
  TableAction,
} from "@/components/admin/AdminDataTable";
import OrderViewDialog from "@/components/admin/OrderViewDialog";
import { format } from "date-fns";
import { formatPrice } from "@/lib/currency";
import { showSuccessMessage, showErrorMessage } from "@/lib/error-handler";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Order extends Record<string, unknown> {
  _id: string;
  orderNumber: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersManagement() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  const viewDialog = useDialog({
    onOpenChange: (open) => {
      if (!open) {
        setSelectedOrder(null);
      }
    },
  });

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/orders?all=true");
      const result = await response.json();

      if (result.success) {
        const ordersData = result.data || [];
        setOrders(ordersData);
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTimeout(async () => {
          await fetchOrders();
        }, 100);
        showSuccessMessage(`Order status updated to ${newStatus}`);
      } else {
        showErrorMessage(data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showErrorMessage("Failed to update order status. Please try again.");
    }
  };

  const handleUpdatePaymentStatus = async (
    orderId: string,
    newPaymentStatus: Order["paymentStatus"]
  ) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTimeout(async () => {
          await fetchOrders();
        }, 100);
        showSuccessMessage(`Payment status updated to ${newPaymentStatus}`);
      } else {
        showErrorMessage(data.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      showErrorMessage("Failed to update payment status. Please try again.");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTimeout(async () => {
          await fetchOrders();
        }, 100);
        showSuccessMessage("Order deleted successfully");
      } else {
        showErrorMessage(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      showErrorMessage("Failed to delete order. Please try again.");
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    showSuccessMessage("Orders refreshed successfully");
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      shipped: "bg-purple-100 text-purple-800 border-purple-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
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

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-gray-100 text-gray-800 border-gray-200",
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

  const columns: TableColumn<Order>[] = [
    {
      key: "orderNumber",
      label: "Order #",
      sortable: true,
      width: "120px",
    },
    {
      key: "user",
      label: "Customer",
      render: (item) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">
              {item.user
                ? `${item.user.firstName} ${item.user.lastName}`
                : "Unknown User"}
            </div>
            <div className="text-sm text-gray-500">
              {item.user?.email || `User ID: ${item.userId}`}
            </div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: "items",
      label: "Items",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <span>{item.items.length} item(s)</span>
        </div>
      ),
    },
    {
      key: "total",
      label: "Total",
      render: (item) => (
        <div className="font-medium">{formatPrice(item.total)}</div>
      ),
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (item) => getPaymentStatusBadge(item.paymentStatus),
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (item) => (
        <div className="flex items-center gap-1">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span className="capitalize">{item.paymentMethod}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (item) => format(new Date(item.createdAt), "MMM dd, yyyy"),
      sortable: true,
    },
  ];

  // Dynamic actions based on order status
  const getActions = (item: Order): TableAction<Order>[] => {
    const actions: TableAction<Order>[] = [];

    actions.push({
      label: "View Details",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (order) => {
        setSelectedOrder(order);
        viewDialog.openDialog();
      },
    });

    if (item.status === "pending") {
      actions.push({
        label: "Mark as Processing",
        icon: <Package className="h-4 w-4 mr-2" />,
        onClick: (order) => handleUpdateOrderStatus(order._id, "processing"),
      });
    }

    if (item.status === "processing") {
      actions.push({
        label: "Mark as Shipped",
        icon: <Truck className="h-4 w-4 mr-2" />,
        onClick: (order) => handleUpdateOrderStatus(order._id, "shipped"),
      });
    }

    if (item.status === "shipped") {
      actions.push({
        label: "Mark as Delivered",
        icon: <CheckCircle className="h-4 w-4 mr-2" />,
        onClick: (order) => handleUpdateOrderStatus(order._id, "delivered"),
      });
    }

    if (item.status !== "cancelled" && item.status !== "delivered") {
      actions.push({
        label: "Cancel Order",
        icon: <XCircle className="h-4 w-4 mr-2" />,
        onClick: (order) => handleUpdateOrderStatus(order._id, "cancelled"),
        variant: "destructive",
        confirm: {
          title: "Cancel Order",
          description:
            "Are you sure you want to cancel this order? This action cannot be undone.",
        },
      });
    }

    if (item.paymentStatus === "pending") {
      actions.push({
        label: "Mark as Paid",
        icon: <CheckCircle className="h-4 w-4 mr-2" />,
        onClick: (order) => handleUpdatePaymentStatus(order._id, "paid"),
      });
    }

    if (item.paymentStatus === "paid") {
      actions.push({
        label: "Mark as Refunded",
        icon: <XCircle className="h-4 w-4 mr-2" />,
        onClick: (order) => handleUpdatePaymentStatus(order._id, "refunded"),
        variant: "destructive",
        confirm: {
          title: "Mark as Refunded",
          description:
            "Are you sure you want to mark this payment as refunded?",
        },
      });
    }

    actions.push({
      label: "Delete Order",
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      onClick: (order) => handleDeleteOrder(order._id),
      variant: "destructive",
      confirm: {
        title: "Delete Order",
        description:
          "Are you sure you want to delete this order? This action cannot be undone.",
      },
    });

    return actions;
  };

  const statusFilterOptions = [
    { key: "all", label: "All Status", value: "all" },
    { key: "pending", label: "Pending", value: "pending" },
    { key: "processing", label: "Processing", value: "processing" },
    { key: "shipped", label: "Shipped", value: "shipped" },
    { key: "delivered", label: "Delivered", value: "delivered" },
    { key: "cancelled", label: "Cancelled", value: "cancelled" },
  ];

  const paymentStatusFilterOptions = [
    { key: "all", label: "All Payment Status", value: "all" },
    { key: "pending", label: "Pending", value: "pending" },
    { key: "paid", label: "Paid", value: "paid" },
    { key: "failed", label: "Failed", value: "failed" },
    { key: "refunded", label: "Refunded", value: "refunded" },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Order Management</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Error loading orders: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            Order Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage orders, track shipments, and update order status
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
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
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        <Card className="p-3 sm:p-6">
          <div className="flex flex-col items-center gap-2">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <p className="text-xs text-muted-foreground text-center">
              Total Orders
            </p>
            <p className="text-base sm:text-lg font-bold">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-3 sm:p-6">
          <div className="flex flex-col items-center gap-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <p className="text-xs text-muted-foreground text-center">
              Total Revenue
            </p>
            <p className="text-base sm:text-lg font-bold">
              {formatPrice(stats.totalRevenue)}
            </p>
          </div>
        </Card>
        <Card className="p-3 sm:p-6">
          <div className="flex flex-col items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            <p className="text-xs text-muted-foreground text-center">
              Pending Orders
            </p>
            <p className="text-base sm:text-lg font-bold">{stats.pending}</p>
          </div>
        </Card>
        <Card className="p-3 sm:p-6">
          <div className="flex flex-col items-center gap-2">
            <Truck className="h-5 w-5 text-purple-600" />
            <p className="text-xs text-muted-foreground text-center">
              Shipped Orders
            </p>
            <p className="text-base sm:text-lg font-bold">{stats.shipped}</p>
          </div>
        </Card>
      </div>

      {/* Orders Data Table */}
      <AdminDataTable<Order>
        title="Orders"
        data={orders}
        columns={columns}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search by order number or customer..."
        searchKey="orderNumber"
        idKey="_id"
        filters={[
          {
            key: "status",
            label: "Filter by status",
            options: statusFilterOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
          {
            key: "paymentStatus",
            label: "Filter by payment status",
            options: paymentStatusFilterOptions,
            value: paymentStatusFilter,
            onChange: setPaymentStatusFilter,
          },
        ]}
        actions={getActions}
        onRefresh={handleRefresh}
        emptyMessage="No orders found"
        emptyIcon={
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        }
        itemsPerPage={10}
        showPagination={true}
      />

      {/* Order Details Dialog */}
      {selectedOrder && (
        <OrderViewDialog
          order={selectedOrder}
          open={viewDialog.open}
          onOpenChange={viewDialog.onOpenChange}
        />
      )}
    </div>
  );
}
