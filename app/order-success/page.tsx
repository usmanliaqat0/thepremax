"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  Phone,
  Home,
  Download,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import { useAuth } from "@/context/AuthContext";

interface OrderData {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  createdAt: string;
}

const OrderSuccess = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { user } = useAuth();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (orderId) {
      fetchOrderData();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch order data");
      }
      const data = await response.json();
      setOrderData(data.order);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load order data"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-heading font-bold text-primary mb-4">
              Order Not Found
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              {error ||
                "The order you're looking for doesn't exist or you don't have permission to view it."}
            </p>
            <Link href="/profile">
              <Button>View My Orders</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const totalItems = orderData.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        {}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. We&apos;ve received your order and will
            send you a confirmation email shortly.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order Number:</span>
                  <Badge variant="secondary" className="font-mono">
                    {orderData.orderNumber}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold text-lg">
                    {formatPrice(orderData.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Items:</span>
                  <span>{totalItems} items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    className={`${
                      orderData.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : orderData.status === "processing"
                        ? "bg-blue-100 text-blue-800"
                        : orderData.status === "shipped"
                        ? "bg-purple-100 text-purple-800"
                        : orderData.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {orderData.status.charAt(0).toUpperCase() +
                      orderData.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <Badge
                    className={`${
                      orderData.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : orderData.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {orderData.paymentStatus.charAt(0).toUpperCase() +
                      orderData.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Estimated Delivery:
                  </span>
                  <span className="font-medium">
                    {orderData.estimatedDelivery}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                What&apos;s Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Confirmation Email</h4>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll receive an order confirmation email at{" "}
                      <span className="font-medium">
                        {user?.email ||
                          orderData.shippingAddress.email ||
                          "your registered email"}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Order Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll start preparing your order right away and
                      notify you when it ships.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Tracking Information</h4>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll receive tracking details via SMS at{" "}
                      <span className="font-medium">
                        {orderData.shippingAddress.phone}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between relative">
              {}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-muted" />

              {}
              <div className="flex flex-col md:flex-row justify-between w-full relative z-10">
                <div className="flex flex-col items-center text-center mb-6 md:mb-0">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-sm">Order Placed</h4>
                  <p className="text-xs text-muted-foreground">Just now</p>
                </div>

                <div className="flex flex-col items-center text-center mb-6 md:mb-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-medium text-sm">Processing</h4>
                  <p className="text-xs text-muted-foreground">1-2 days</p>
                </div>

                <div className="flex flex-col items-center text-center mb-6 md:mb-0">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mb-2">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-sm">Shipped</h4>
                  <p className="text-xs text-muted-foreground">2-3 days</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mb-2">
                    <Home className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-sm">Delivered</h4>
                  <p className="text-xs text-muted-foreground">3-5 days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/profile">
              <Button variant="outline" className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Track Order
              </Button>
            </Link>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </Button>
            <Link href="/shop">
              <Button className="w-full">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        {}
        <Card className="max-w-4xl mx-auto mt-8">
          <CardContent className="text-center py-8">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              If you have any questions about your order, feel free to contact
              us.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact">
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Call: +1 512-355-5110
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
