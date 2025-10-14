"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Tag,
  Truck,
  Shield,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { formatPrice } from "@/lib/currency";

const Cart = () => {
  const {
    state,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemsCount,
    applyPromoCode: contextApplyPromoCode,
    removePromoCode: contextRemovePromoCode,
  } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useScrollToTop();

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setIsValidatingPromo(true);
    setPromoError("");

    try {
      const cartItems = state.items.map((item) => ({
        productId: item.product._id,
        categoryId: item.product.category?._id,
        quantity: item.quantity,
        price: item.product.basePrice,
      }));

      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCode,
          cartItems,
          subtotal: getCartTotal(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        contextApplyPromoCode(
          data.data.code,
          data.data.type,
          data.data.value,
          data.data.discount,
          data.data.description
        );
        setPromoError("");
        setPromoCode("");
      } else {
        setPromoError(data.error || "Invalid promo code");
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoError("Failed to validate promo code");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const removePromoCode = () => {
    contextRemovePromoCode();
    setPromoError("");
  };

  const subtotal = getCartTotal();
  const discount = state.appliedPromoCode ? state.appliedPromoCode.discount : 0;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-heading font-bold mb-2">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven&apos;t added anything to your cart yet.
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-8 sm:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary mb-2">
                Shopping Cart
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {getCartItemsCount()} items in your cart
              </p>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div
                      key={`${item.id}-${item.size}-${item.color}`}
                      className="flex flex-col sm:flex-row gap-4 p-4 sm:p-0 border-b last:border-b-0 sm:border sm:rounded-lg hover:shadow-sm transition-shadow"
                    >
                      {/* Product Image & Info */}
                      <div className="flex flex-1 gap-3 sm:gap-4 min-w-0">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                          <Image
                            src={
                              item.product.images[0]?.url ||
                              "/placeholder-product.jpg"
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                            {item.product.category?.name || "Uncategorized"}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.size && (
                              <Badge variant="outline" className="text-xs">
                                Size: {item.size}
                              </Badge>
                            )}
                            {item.color && (
                              <Badge variant="outline" className="text-xs">
                                Color: {item.color}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity, Price & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              isUpdating ===
                              `${item.id}-${item.size}-${item.color}`
                            }
                            onClick={async () => {
                              const key = `${item.id}-${item.size}-${item.color}`;
                              setIsUpdating(key);
                              try {
                                updateQuantity(
                                  item.id,
                                  item.size,
                                  item.color,
                                  Math.max(0, item.quantity - 1)
                                );
                              } finally {
                                setTimeout(() => setIsUpdating(null), 500);
                              }
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              isUpdating ===
                              `${item.id}-${item.size}-${item.color}`
                            }
                            onClick={async () => {
                              const key = `${item.id}-${item.size}-${item.color}`;
                              setIsUpdating(key);
                              try {
                                updateQuantity(
                                  item.id,
                                  item.size,
                                  item.color,
                                  item.quantity + 1
                                );
                              } finally {
                                setTimeout(() => setIsUpdating(null), 500);
                              }
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-[80px]">
                          <div className="hidden sm:block text-xs text-muted-foreground mb-0.5">
                            {formatPrice(item.product.basePrice)} each
                          </div>
                          <div className="font-semibold text-sm sm:text-base">
                            {formatPrice(
                              item.product.basePrice * item.quantity
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeFromCart(item.id, item.size, item.color)
                          }
                          className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!state.appliedPromoCode ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && applyPromoCode()
                          }
                          disabled={isValidatingPromo}
                        />
                        <Button
                          variant="outline"
                          onClick={applyPromoCode}
                          disabled={isValidatingPromo || !promoCode.trim()}
                        >
                          {isValidatingPromo ? "Validating..." : "Apply"}
                        </Button>
                      </div>
                      {promoError && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {promoError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-800">
                            {state.appliedPromoCode.code} Applied
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-green-800">
                          {state.appliedPromoCode.type === "percentage"
                            ? `-${state.appliedPromoCode.value}%`
                            : `-$${state.appliedPromoCode.value}`}
                        </div>
                      </div>
                      {state.appliedPromoCode.description && (
                        <p className="text-xs text-muted-foreground">
                          {state.appliedPromoCode.description}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removePromoCode}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
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

                  <Link href="/checkout" className="block mt-6">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <div className="space-y-3 mt-6 pt-6 border-t">
                    <div className="flex items-center gap-3 text-sm">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>Free shipping on orders over $50</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Secure checkout guaranteed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
