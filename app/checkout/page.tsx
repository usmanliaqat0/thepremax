"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  CreditCard,
  MapPin,
  ArrowLeft,
  Check,
  AlertCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { formatPrice } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { USA_STATES, getCitiesByState } from "@/lib/usa-address-data";
import { cn } from "@/lib/utils";
import { Address } from "@/lib/types";

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

const Checkout = () => {
  const { state, getCartTotal, getCartItemsCount, clearCart } = useCart();
  const { state: authState, refreshUser } = useAuth();
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    state: "",
    country: "USA",
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useNewAddress, setUseNewAddress] = useState(true); // Start with new address mode
  const [saveAddress, setSaveAddress] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useScrollToTop();

  const populateAddressFromSaved = useCallback(
    (address: Address) => {
      setShippingInfo({
        fullName: `${address.firstName} ${address.lastName}`.trim(),
        email: authState.user?.email || "",
        phone: address.phone,
        address: address.address,
        city: address.city,
        postalCode: address.postalCode,
        state: address.state,
        country: address.country,
      });

      // Set available cities for the selected state
      if (address.state) {
        setAvailableCities(getCitiesByState(address.state));
      }
    },
    [authState.user?.email]
  );

  // Fetch saved addresses on component mount
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const response = await fetch("/api/profile/addresses", {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSavedAddresses(data.data);
            // Auto-select default address if available
            const defaultAddress = data.data.find(
              (addr: Address) => addr.isDefault
            );
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setUseNewAddress(false);
              populateAddressFromSaved(defaultAddress);
            } else if (data.data.length > 0) {
              // If no default but has addresses, select first one
              setSelectedAddressId(data.data[0].id);
              setUseNewAddress(false);
              populateAddressFromSaved(data.data[0]);
            } else {
              // No saved addresses, use new address mode
              setUseNewAddress(true);
              setSelectedAddressId("new");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching saved addresses:", error);
      }
    };

    if (authState.token) {
      fetchSavedAddresses();
    }
  }, [authState.token, populateAddressFromSaved]);

  const handleAddressSelection = (addressId: string) => {
    console.log("Address selection changed:", addressId);
    setSelectedAddressId(addressId);
    setUseNewAddress(false);

    if (addressId === "new") {
      setUseNewAddress(true);
      console.log("Using new address mode");
      // Clear form
      setShippingInfo({
        fullName: "",
        email: authState.user?.email || "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
        state: "",
        country: "USA",
      });
      setAvailableCities([]);
    } else {
      const selectedAddress = savedAddresses.find(
        (addr) => addr.id === addressId
      );
      if (selectedAddress) {
        console.log("Using saved address:", selectedAddress);
        populateAddressFromSaved(selectedAddress);
      }
    }
  };

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
  const discount = state.appliedPromoCode ? state.appliedPromoCode.discount : 0;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping + tax;

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo({ ...shippingInfo, [name]: value });
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentInfo({ ...paymentInfo, [name]: value });
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: "" });
    }
  };

  const handleStateChange = (stateCode: string) => {
    setShippingInfo({ ...shippingInfo, state: stateCode, city: "" });
    setAvailableCities(getCitiesByState(stateCode));
    // Clear validation errors
    const newErrors = { ...validationErrors };
    delete newErrors.state;
    delete newErrors.city;
    setValidationErrors(newErrors);
  };

  const handleCityChange = (city: string) => {
    setShippingInfo({ ...shippingInfo, city });
    // Clear validation error
    if (validationErrors.city) {
      setValidationErrors({ ...validationErrors, city: "" });
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Validate shipping information
    if (!shippingInfo.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    if (!shippingInfo.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!shippingInfo.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (
      !/^\(\d{3}\) \d{3}-\d{4}$/.test(shippingInfo.phone) &&
      !/^\d{10}$/.test(shippingInfo.phone.replace(/\D/g, ""))
    ) {
      errors.phone = "Please enter a valid phone number";
    }
    if (!shippingInfo.address.trim()) {
      errors.address = "Address is required";
    }
    if (!shippingInfo.city.trim()) {
      errors.city = "City is required";
    }
    if (!shippingInfo.postalCode.trim()) {
      errors.postalCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(shippingInfo.postalCode)) {
      errors.postalCode = "Please enter a valid ZIP code";
    }
    if (!shippingInfo.state) {
      errors.state = "State is required";
    }

    // Validate payment information if credit card is selected
    if (paymentMethod === "card") {
      if (!paymentInfo.cardName.trim()) {
        errors.cardName = "Name on card is required";
      }
      if (!paymentInfo.cardNumber.trim()) {
        errors.cardNumber = "Card number is required";
      } else if (
        !/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(
          paymentInfo.cardNumber.replace(/\s/g, "")
        )
      ) {
        errors.cardNumber = "Please enter a valid card number";
      }
      if (!paymentInfo.expiryDate.trim()) {
        errors.expiryDate = "Expiry date is required";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiryDate)) {
        errors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      }
      if (!paymentInfo.cvv.trim()) {
        errors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
        errors.cvv = "Please enter a valid CVV";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      toast({
        title: "Please fix the errors below",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

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
      const orderItems = state.items.map((item) => ({
        productId: item.product._id,
        name: item.product.name,
        image: item.product.images[0]?.url || "/placeholder-product.jpg",
        price: item.product.basePrice,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

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
        promoCode: state.appliedPromoCode
          ? {
              code: state.appliedPromoCode.code,
              type: state.appliedPromoCode.type,
              value: state.appliedPromoCode.value,
              discount: state.appliedPromoCode.discount,
            }
          : undefined,
        discount: discount,
        shippingAddress: {
          firstName,
          lastName,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
        },
        billingAddress: {
          firstName,
          lastName,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
        },
      };

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
        throw new Error(errorData.message || "Failed to create order");
      }

      const result = await response.json();

      // Save address if requested and using new address
      if (saveAddress && (useNewAddress || selectedAddressId === "new")) {
        try {
          console.log("Saving address:", {
            saveAddress,
            useNewAddress,
            selectedAddressId,
            shippingInfo,
          });

          const addressResponse = await fetch("/api/profile/addresses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authState.token}`,
            },
            body: JSON.stringify({
              type: "shipping",
              firstName: firstName,
              lastName: lastName,
              phone: shippingInfo.phone,
              address: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postalCode: shippingInfo.postalCode,
              country: shippingInfo.country,
              isDefault: savedAddresses.length === 0, // Set as default if it's the first address
            }),
          });

          const addressData = await addressResponse.json();
          console.log("Address save response:", addressData);

          if (addressResponse.ok && addressData.success) {
            // Refresh user data to update addresses in auth context
            console.log("Refreshing user data after address save...");
            await refreshUser();
            console.log(
              "User data refreshed, addresses should now be visible in profile"
            );
            toast({
              title: "Address saved!",
              description: "Your address has been saved for future orders.",
            });
          } else {
            console.error("Address save failed:", addressData);
            toast({
              title: "Address save failed",
              description:
                addressData.message ||
                "Could not save address, but order was placed successfully.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error saving address:", error);
          toast({
            title: "Address save failed",
            description:
              "Could not save address, but order was placed successfully.",
            variant: "destructive",
          });
        }
      }

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
      <section className="py-8 sm:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary mb-2">
                Checkout
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Complete your purchase securely
              </p>
            </div>
            <Link href="/cart">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {}
          <div className="space-y-6 sm:space-y-8">
            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Saved Addresses Selection */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-3 block">
                      Choose a saved address or enter a new one
                    </Label>
                    <div className="space-y-3">
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-colors",
                            selectedAddressId === address.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                          onClick={() => handleAddressSelection(address.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {address.firstName} {address.lastName}
                                </span>
                                {address.isDefault && (
                                  <Badge variant="outline" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {address.address}, {address.city},{" "}
                                {address.state} {address.postalCode}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.phone}
                              </p>
                            </div>
                            <div className="ml-2">
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                  selectedAddressId === address.id
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground"
                                )}
                              >
                                {selectedAddressId === address.id && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-colors",
                          selectedAddressId === "new" || useNewAddress
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => handleAddressSelection("new")}
                      >
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          <span className="font-medium">Use a new address</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <form className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="mb-2 block text-sm">
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleShippingChange}
                        required
                        className={cn(
                          "h-10",
                          validationErrors.fullName &&
                            "border-red-500 focus:border-red-500"
                        )}
                      />
                      {validationErrors.fullName && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          <span>{validationErrors.fullName}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="mb-2 block text-sm">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        required
                        className={cn(
                          "h-10",
                          validationErrors.email &&
                            "border-red-500 focus:border-red-500"
                        )}
                      />
                      {validationErrors.email && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          <span>{validationErrors.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="mb-2 block text-sm">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      placeholder="(555) 123-4567"
                      required
                      className={cn(
                        "h-10",
                        validationErrors.phone &&
                          "border-red-500 focus:border-red-500"
                      )}
                    />
                    {validationErrors.phone && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        <span>{validationErrors.phone}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="address" className="mb-2 block text-sm">
                      Street Address *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      placeholder="123 Main Street"
                      required
                      className={cn(
                        "h-10",
                        validationErrors.address &&
                          "border-red-500 focus:border-red-500"
                      )}
                    />
                    {validationErrors.address && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        <span>{validationErrors.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Country Field - Disabled with USA selected */}
                  <div>
                    <Label htmlFor="country" className="mb-2 block text-sm">
                      Country
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      value="United States"
                      disabled
                      className="h-10 bg-muted"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="state" className="text-sm">
                        State *
                      </Label>
                      <Select
                        value={shippingInfo.state}
                        onValueChange={handleStateChange}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-10 w-full",
                            validationErrors.state &&
                              "border-red-500 focus:border-red-500"
                          )}
                        >
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {USA_STATES.map((state) => (
                            <SelectItem key={state.code} value={state.code}>
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.state && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          <span>{validationErrors.state}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-sm">
                        City *
                      </Label>
                      <Select
                        value={shippingInfo.city}
                        onValueChange={handleCityChange}
                        disabled={!shippingInfo.state}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-10 w-full",
                            validationErrors.city &&
                              "border-red-500 focus:border-red-500"
                          )}
                        >
                          <SelectValue
                            placeholder={
                              shippingInfo.state
                                ? "Select city"
                                : "Select state first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.city && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                          <AlertCircle className="h-3 w-3" />
                          <span>{validationErrors.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="postalCode" className="text-sm">
                      ZIP Code *
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={shippingInfo.postalCode}
                      onChange={handleShippingChange}
                      placeholder="12345"
                      required
                      className={cn(
                        "h-10",
                        validationErrors.postalCode &&
                          "border-red-500 focus:border-red-500"
                      )}
                    />
                    {validationErrors.postalCode && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                        <AlertCircle className="h-3 w-3" />
                        <span>{validationErrors.postalCode}</span>
                      </div>
                    )}
                  </div>

                  {/* Save Address Checkbox - Only show when using new address */}
                  {useNewAddress && (
                    <div className="flex items-center space-x-2 pt-4 border-t">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="saveAddress" className="text-sm">
                        Save this address for future orders
                      </Label>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {}
                  <div>
                    <Label className="text-sm">Payment Method</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <Button
                        type="button"
                        variant={
                          paymentMethod === "card" ? "default" : "outline"
                        }
                        onClick={() => setPaymentMethod("card")}
                        className="justify-start h-10"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span className="text-sm">Credit Card</span>
                      </Button>
                      <Button
                        type="button"
                        variant={
                          paymentMethod === "cod" ? "default" : "outline"
                        }
                        onClick={() => setPaymentMethod("cod")}
                        className="justify-start h-10"
                      >
                        <span className="mr-2">💰</span>
                        <span className="text-sm">Cash on Delivery</span>
                      </Button>
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardName" className="text-sm">
                          Name on Card *
                        </Label>
                        <Input
                          id="cardName"
                          name="cardName"
                          value={paymentInfo.cardName}
                          onChange={handlePaymentChange}
                          required
                          className={cn(
                            "h-10",
                            validationErrors.cardName &&
                              "border-red-500 focus:border-red-500"
                          )}
                        />
                        {validationErrors.cardName && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            <span>{validationErrors.cardName}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cardNumber" className="text-sm">
                          Card Number *
                        </Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber}
                          onChange={handlePaymentChange}
                          required
                          className={cn(
                            "h-10",
                            validationErrors.cardNumber &&
                              "border-red-500 focus:border-red-500"
                          )}
                        />
                        {validationErrors.cardNumber && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            <span>{validationErrors.cardNumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate" className="text-sm">
                            Expiry Date *
                          </Label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            placeholder="MM/YY"
                            value={paymentInfo.expiryDate}
                            onChange={handlePaymentChange}
                            required
                            className={cn(
                              "h-10",
                              validationErrors.expiryDate &&
                                "border-red-500 focus:border-red-500"
                            )}
                          />
                          {validationErrors.expiryDate && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                              <AlertCircle className="h-3 w-3" />
                              <span>{validationErrors.expiryDate}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-sm">
                            CVV *
                          </Label>
                          <Input
                            id="cvv"
                            name="cvv"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={handlePaymentChange}
                            required
                            className={cn(
                              "h-10",
                              validationErrors.cvv &&
                                "border-red-500 focus:border-red-500"
                            )}
                          />
                          {validationErrors.cvv && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-red-500">
                              <AlertCircle className="h-3 w-3" />
                              <span>{validationErrors.cvv}</span>
                            </div>
                          )}
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
            <Card className="sticky top-4 sm:top-8">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Order Summary
                </CardTitle>
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
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs sm:text-sm line-clamp-2">
                            {item.product.name}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
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
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </span>
                            <span className="font-medium text-xs sm:text-sm">
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
                      <span className="text-sm sm:text-base">
                        Processing...
                      </span>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="text-sm sm:text-base">
                          Place Order
                        </span>
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
