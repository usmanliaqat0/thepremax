"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageLayout from "@/components/ui/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshLoader } from "@/components/ui/loader";
import {
  Search,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

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
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  items: OrderItem[];
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

interface TrackingUpdate {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

const TrackOrderContent = () => {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("orderNumber") || ""
  );
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
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

  const getStatusDescription = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "Your order is being prepared";
      case "processing":
        return "Your order is being processed";
      case "shipped":
        return "Your order is on its way";
      case "delivered":
        return "Your order has been delivered";
      case "cancelled":
        return "Your order has been cancelled";
      default:
        return "Order status unknown";
    }
  };

  const generateTrackingUpdates = (order: Order): TrackingUpdate[] => {
    const updates: TrackingUpdate[] = [];

    updates.push({
      status: "Order Placed",
      location: "Online Store",
      timestamp: new Date(order.createdAt).toISOString(),
      description: "Your order has been placed successfully",
    });

    if (order.status !== "pending") {
      updates.push({
        status: "Processing",
        location: "Warehouse",
        timestamp: new Date(order.updatedAt).toISOString(),
        description: "Your order is being prepared for shipment",
      });
    }

    if (order.status === "shipped" || order.status === "delivered") {
      updates.push({
        status: "Shipped",
        location: "Distribution Center",
        timestamp: new Date(order.updatedAt).toISOString(),
        description: `Your order has been shipped${
          order.trackingNumber
            ? ` with tracking number ${order.trackingNumber}`
            : ""
        }`,
      });
    }

    if (order.status === "delivered") {
      updates.push({
        status: "Delivered",
        location: order.shippingAddress.city,
        timestamp: order.deliveredAt || new Date().toISOString(),
        description: "Your order has been delivered successfully",
      });
    }

    if (order.status === "cancelled") {
      updates.push({
        status: "Cancelled",
        location: "Customer Service",
        timestamp: new Date(order.updatedAt).toISOString(),
        description: "Your order has been cancelled",
      });
    }

    return updates.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const fetchOrder = useCallback(
    async (orderNum: string) => {
      if (!orderNum.trim()) {
        setError("Please enter an order number");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/orders/track?orderNumber=${encodeURIComponent(orderNum)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data.order);
        setTrackingUpdates(generateTrackingUpdates(data.order));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch order";
        setError(errorMessage);
        setOrder(null);
        setTrackingUpdates([]);

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    setDownloadingInvoice(true);

    try {
      let token = localStorage.getItem("auth_token");

      if (!token) {
        const cookieMatch = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="));
        token = cookieMatch?.split("=")[1] || null;
      }

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "You don't have permission to download this invoice."
          );
        } else {
          throw new Error("Failed to download invoice");
        }
      }

      const htmlContent = await response.text();
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.download = `invoice-${orderNumber}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded successfully",
      });
    } catch (error) {
      console.error("Invoice download error:", error);
      toast({
        title: "Download Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const refreshOrder = () => {
    if (order) {
      fetchOrder(order.orderNumber);
    }
  };

  const handleOrderNumberChange = (value: string) => {
    setOrderNumber(value);
  };

  useEffect(() => {
    const urlOrderNumber = searchParams.get("orderNumber");
    if (urlOrderNumber && !hasAutoSearched) {
      setHasAutoSearched(true);
      fetchOrder(urlOrderNumber);
    }
  }, [searchParams, hasAutoSearched, fetchOrder]);

  return (
    <PageLayout className="bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your order number to track your package
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter your order number (e.g., ORD-123456-ABC123)"
                  value={orderNumber}
                  onChange={(e) => handleOrderNumberChange(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !orderNumber.trim()}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Track Order
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert className="mb-8" variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Status Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Order Status</CardTitle>
                    <p className="text-gray-600">Order #{order.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshOrder}
                      disabled={loading}
                    >
                      <RefreshCw
                        className={`w-4 h-4 mr-2 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(order._id)}
                      disabled={downloadingInvoice}
                    >
                      {downloadingInvoice ? (
                        <>
                          <RefreshLoader
                            size="sm"
                            variant="muted"
                            className="mr-2"
                          />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Invoice
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <Badge
                      className={`${getStatusColor(
                        order.status
                      )} text-sm font-medium`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                    <p className="text-gray-600 mt-1">
                      {getStatusDescription(order.status)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Order Date</p>
                    <p className="text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Total Amount</p>
                    <p className="text-gray-600">{formatPrice(order.total)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Status</p>
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "default" : "secondary"
                      }
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">Tracking Number</p>
                    <p className="text-blue-700 font-mono">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}

                {order.estimatedDelivery && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900">
                      Estimated Delivery
                    </p>
                    <p className="text-green-700">
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Tracking Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingUpdates.map((update, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            index === trackingUpdates.length - 1
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">
                            {update.status}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(update.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {update.location}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {update.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                          {item.size && ` • Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">
                    {order.shippingAddress.firstName}{" "}
                    {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Phone: {order.shippingAddress.phone}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

const TrackOrderPage = () => {
  return (
    <Suspense
      fallback={
        <PageLayout className="bg-gray-50">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="text-center">
              <RefreshLoader size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </PageLayout>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
};

export default TrackOrderPage;
