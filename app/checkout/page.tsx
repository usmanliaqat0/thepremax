"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, MapPin, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { formatPrice } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

const Checkout = () => {
  const { state, getCartTotal, getCartItemsCount, clearCart } = useCart();
  const { state: authState } = useAuth();
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    province: "",
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useScrollToTop();

  // Redirect to login if not authenticated
  if (!authState.token) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <h2 className="text-2xl font-heading font-bold mb-4">
                Authentication Required
              </h2>
              <p className="text-muted-foreground mb-6">
                Please log in to proceed with checkout.
              </p>
              <Link href="/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <h2 className="text-2xl font-heading font-bold mb-4">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart before proceeding to checkout.
              </p>
              <Link href="/shop">
                <Button className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Check if user is authenticated
    if (!authState.token) {
      toast({
        title: "Authentication required",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      router.push("/login");
      setIsProcessing(false);
      return;
    }

    try {
      // Prepare order data
      const orderItems = state.items.map((item) => ({
        productId: item.id,
        name: item.product.name,
        image: item.product.images[0]?.url || "/placeholder-product.jpg",
        price: item.product.basePrice,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      // Split full name into first and last name
      const nameParts = shippingInfo.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const orderData = {
        items: orderItems,
        subtotal,
        tax,
        shipping,
        total,
        paymentMethod,
        shippingAddress: {
          firstName,
          lastName,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.province,
          postalCode: shippingInfo.postalCode,
          country: "Pakistan",
        },
        billingAddress: {
          firstName,
          lastName,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.province,
          postalCode: shippingInfo.postalCode,
          country: "Pakistan",
        },
      };

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const result = await response.json();

      // Clear cart and redirect
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: `Order #${result.order.orderNumber} has been created. You will receive a confirmation email shortly.`,
      });
      router.push(`/order-success?orderId=${result.order._id}`);
    } catch (error) {
      console.error("Order creation error:", error);
      toast({
        title: "Order failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">
                Checkout
              </h1>
              <p className="text-muted-foreground">
                Complete your purchase securely
              </p>
            </div>
            <Link href="/cart">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <div className="space-y-8">
            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="mb-2 block">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2 block">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="mb-2 block">
                      Address
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Province</Label>
                      <Select
                        value={shippingInfo.province}
                        onValueChange={(value) =>
                          setShippingInfo({ ...shippingInfo, province: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="punjab">Punjab</SelectItem>
                          <SelectItem value="sindh">Sindh</SelectItem>
                          <SelectItem value="kpk">KPK</SelectItem>
                          <SelectItem value="balochistan">
                            Balochistan
                          </SelectItem>
                          <SelectItem value="islamabad">Islamabad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {}
                  <div>
                    <Label>Payment Method</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Button
                        type="button"
                        variant={
                          paymentMethod === "card" ? "default" : "outline"
                        }
                        onClick={() => setPaymentMethod("card")}
                        className="justify-start"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Credit Card
                      </Button>
                      <Button
                        type="button"
                        variant={
                          paymentMethod === "cod" ? "default" : "outline"
                        }
                        onClick={() => setPaymentMethod("cod")}
                        className="justify-start"
                      >
                        💰 Cash on Delivery
                      </Button>
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          value={paymentInfo.cardName}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={paymentInfo.expiryDate}
                            onChange={handlePaymentChange}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={handlePaymentChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        You will pay when your order is delivered. Additional
                        charges may apply.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {}
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <div
                        key={`${item.id}-${item.size}-${item.color}`}
                        className="flex gap-3"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={
                              item.product.images[0]?.url ||
                              "/placeholder-product.jpg"
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {item.product.name}
                          </h4>
                          <div className="flex gap-2 mt-1">
                            {item.size && (
                              <Badge variant="outline" className="text-xs">
                                {item.size}
                              </Badge>
                            )}
                            {item.color && (
                              <Badge variant="outline" className="text-xs">
                                {item.color}
                              </Badge>
                            )}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                            <span className="font-medium text-sm">
                              {formatPrice(
                                item.product.basePrice * item.quantity
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({getCartItemsCount()} items)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? "Free" : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="w-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Place Order
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By placing your order, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
