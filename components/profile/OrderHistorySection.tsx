"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  Download,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
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
}

const OrderHistorySection = () => {
  const { state } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!state.token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setOrders(result.orders || []);
        } else {
          const errorData = await response.json();
          console.error("Orders API error:", errorData);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [state.token]);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTrackOrder = (trackingNumber: string) => {
    window.open(`https://example-tracking.com/${trackingNumber}`, "_blank");
  };

  const handleDownloadInvoice = (orderNumber: string) => {
    console.log(`Downloading invoice for order ${orderNumber}`);
  };

  const handleReorder = (order: Order) => {
    console.log(`Reordering items from order ${order.orderNumber}`);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!state.token) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (response.ok) {
        // Refresh orders
        const ordersResponse = await fetch("/api/orders", {
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        });

        if (ordersResponse.ok) {
          const result = await ordersResponse.json();
          setOrders(result.orders || []);
        }
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                Track your orders and view past purchases
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "No orders match your search criteria"
                  : "You haven't placed any orders yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <h3 className="font-semibold text-lg">
                          #{order.orderNumber}
                        </h3>
                        <Badge
                          className={`flex items-center space-x-1 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""} • $
                          {order.total.toFixed(2)}
                        </p>
                        {order.trackingNumber && (
                          <p>Tracking: {order.trackingNumber}</p>
                        )}
                        {order.estimatedDelivery && (
                          <p>
                            Est. delivery:{" "}
                            {new Date(
                              order.estimatedDelivery
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {}
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div
                          key={item.productId}
                          className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden"
                          style={{ zIndex: order.items.length - index }}
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    {}
                    <div className="flex flex-wrap gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-[700px]">
                          <DialogHeader>
                            <DialogTitle>
                              Order #{order.orderNumber}
                            </DialogTitle>
                            <DialogDescription>
                              Placed on{" "}
                              {new Date(order.createdAt).toLocaleDateString()}
                            </DialogDescription>
                          </DialogHeader>

                          {selectedOrder && (
                            <div className="space-y-6">
                              {}
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={`flex items-center space-x-1 ${getStatusColor(
                                    selectedOrder.status
                                  )}`}
                                >
                                  {getStatusIcon(selectedOrder.status)}
                                  <span className="capitalize">
                                    {selectedOrder.status}
                                  </span>
                                </Badge>
                                {selectedOrder.trackingNumber && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleTrackOrder(
                                        selectedOrder.trackingNumber!
                                      )
                                    }
                                  >
                                    <Truck className="w-4 h-4 mr-2" />
                                    Track Package
                                  </Button>
                                )}
                              </div>

                              {}
                              <div>
                                <h4 className="font-medium mb-3">
                                  Items Ordered
                                </h4>
                                <div className="space-y-3">
                                  {selectedOrder.items.map((item) => (
                                    <div
                                      key={item.productId}
                                      className="flex items-center space-x-4 p-3 border rounded-lg"
                                    >
                                      <Image
                                        src={item.image}
                                        alt={item.name}
                                        width={64}
                                        height={64}
                                        className="w-16 h-16 object-cover rounded-lg"
                                      />
                                      <div className="flex-1">
                                        <h5 className="font-medium">
                                          {item.name}
                                        </h5>
                                        <div className="text-sm text-gray-600 space-y-1">
                                          {item.size && (
                                            <p>Size: {item.size}</p>
                                          )}
                                          {item.color && (
                                            <p>Color: {item.color}</p>
                                          )}
                                          <p>Quantity: {item.quantity}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium">
                                          $
                                          {(item.price * item.quantity).toFixed(
                                            2
                                          )}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          ${item.price.toFixed(2)} each
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {}
                              <div className="border-t pt-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>
                                      ${selectedOrder.subtotal.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>
                                      ${selectedOrder.shipping.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>${selectedOrder.tax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                                    <span>Total</span>
                                    <span>
                                      ${selectedOrder.total.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {}
                              <div>
                                <h4 className="font-medium mb-2">
                                  Shipping Address
                                </h4>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="font-medium">
                                    {selectedOrder.shippingAddress.firstName}{" "}
                                    {selectedOrder.shippingAddress.lastName}
                                  </p>
                                  <p>{selectedOrder.shippingAddress.address}</p>
                                  <p>
                                    {selectedOrder.shippingAddress.city},{" "}
                                    {selectedOrder.shippingAddress.state}{" "}
                                    {selectedOrder.shippingAddress.postalCode}
                                  </p>
                                  <p>{selectedOrder.shippingAddress.country}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {order.trackingNumber && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleTrackOrder(order.trackingNumber!)
                          }
                        >
                          <Truck className="w-4 h-4 mr-2" />
                          Track
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(order.orderNumber)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>

                      {order.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelOrder(order._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel Order
                        </Button>
                      )}

                      {order.status === "delivered" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReorder(order)}
                        >
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderHistorySection;
