"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MapPin, Home, Building } from "lucide-react";
import { toast } from "sonner";
import { Address } from "@/lib/types";

const AddressSection = () => {
  const { state, updateProfile } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Sync addresses from user data
  useEffect(() => {
    if (state.user?.addresses) {
      setAddresses(state.user.addresses);
    }
  }, [state.user?.addresses]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Address>>({
    type: "shipping",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    isDefault: false,
  });

  const handleInputChange = (field: keyof Address, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const addressData = {
        ...formData,
        country: "United States", // Force country to always be United States
        id: editingAddress?.id || Date.now().toString(),
      } as Address;

      let updatedAddresses: Address[];

      if (editingAddress) {
        // Update existing address
        updatedAddresses = addresses.map((addr) =>
          addr.id === editingAddress.id ? addressData : addr
        );
      } else {
        // Add new address
        if (addressData.isDefault) {
          // Remove default from other addresses
          updatedAddresses = addresses.map((addr) => ({
            ...addr,
            isDefault: false,
          }));
        } else {
          updatedAddresses = [...addresses];
        }
        updatedAddresses.push(addressData);
      }

      // Update via API
      const success = await updateProfile({ addresses: updatedAddresses });

      if (success) {
        toast.success(
          editingAddress
            ? "Address updated successfully!"
            : "Address added successfully!"
        );
        resetForm();
      } else {
        toast.error("Failed to save address");
      }
    } catch {
      toast.error("Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData(address);
    setIsDialogOpen(true);
  };

  const handleDelete = async (addressId: string) => {
    try {
      const updatedAddresses = addresses.filter(
        (addr) => addr.id !== addressId
      );
      const success = await updateProfile({ addresses: updatedAddresses });

      if (success) {
        toast.success("Address deleted successfully!");
      } else {
        toast.error("Failed to delete address");
      }
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));

      const success = await updateProfile({ addresses: updatedAddresses });

      if (success) {
        toast.success("Default address updated!");
      } else {
        toast.error("Failed to update default address");
      }
    } catch {
      toast.error("Failed to update default address");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "shipping",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
      isDefault: false,
    });
    setEditingAddress(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Saved Addresses</CardTitle>
            <CardDescription>
              Manage your shipping and billing addresses
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </DialogTitle>
                <DialogDescription>
                  Enter the address details below
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Address Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "shipping" | "billing") =>
                        handleInputChange("type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shipping">Shipping</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        handleInputChange("isDefault", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isDefault" className="text-sm">
                      Set as default address
                    </Label>
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter street address"
                  />
                </div>

                {/* City, State, Postal Code */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State/Province</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Postal Code</Label>
                    <Input
                      value={formData.postalCode}
                      onChange={(e) =>
                        handleInputChange("postalCode", e.target.value)
                      }
                      placeholder="ZIP/Postal Code"
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label>Country</Label>
                  <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md">
                    <span className="text-gray-700">United States</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Currently only available for United States addresses
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Address"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No addresses saved
              </h3>
              <p className="text-gray-600 mb-4">
                Add your first address to get started with faster checkout
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg ${
                    address.isDefault
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {address.type === "shipping" ? (
                          <Home className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Building className="w-4 h-4 text-green-600" />
                        )}
                        <Badge
                          variant={
                            address.type === "shipping"
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {address.type}
                        </Badge>
                        {address.isDefault && (
                          <Badge
                            variant="outline"
                            className="text-blue-600 border-blue-200"
                          >
                            Default
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium">
                          {address.firstName} {address.lastName}
                        </p>
                        <p className="text-gray-600">{address.address}</p>
                        <p className="text-gray-600">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-gray-600">{address.country}</p>
                        <p className="text-gray-600">{address.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(address)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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

export default AddressSection;
