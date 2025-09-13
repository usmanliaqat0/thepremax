"use client";

import { useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";

const OrderSuccess = () => {
  // Generate a random order number
  const orderNumber = `FM-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Mock order data
  const orderData = {
    orderNumber,
    total: 15800,
    items: 3,
    estimatedDelivery: "3-5 business days",
    email: "customer@example.com",
    phone: "+1 (555) 123-4567",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        {/* Success Message */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your purchase. We've received your order and will send
            you a confirmation email shortly.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
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
                  <span>{orderData.items} items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    Processing
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

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Confirmation Email</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an order confirmation email at{" "}
                      <span className="font-medium">{orderData.email}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Order Processing</h4>
                    <p className="text-sm text-muted-foreground">
                      We'll start preparing your order right away and notify you
                      when it ships.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">Tracking Information</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll receive tracking details via SMS at{" "}
                      <span className="font-medium">{orderData.phone}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Timeline */}
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-muted" />

              {/* Steps */}
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

        {/* Actions */}
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

        {/* Support */}
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
                Call: +1 (555) 123-4567
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
