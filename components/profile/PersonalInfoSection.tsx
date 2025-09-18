"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

const PersonalInfoSection = () => {
  const { state, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "" as "male" | "female" | "other" | "",
    dateOfBirth: "",
  });

  // Sync form data with user state when it changes
  useEffect(() => {
    if (state.user) {
      setFormData({
        firstName: state.user.firstName || "",
        lastName: state.user.lastName || "",
        email: state.user.email || "",
        phone: state.user.phone || "",
        gender: state.user.gender || ("" as "male" | "female" | "other" | ""),
        dateOfBirth: state.user.dateOfBirth || "",
      });
    }
  }, [state.user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    // Validate phone number if provided
    if (formData.phone && formData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      };

      const success = await updateProfile(updateData);
      if (success) {
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: state.user?.firstName || "",
      lastName: state.user?.lastName || "",
      email: state.user?.email || "",
      phone: state.user?.phone || "",
      gender: state.user?.gender || ("" as "male" | "female" | "other" | ""),
      dateOfBirth: state.user?.dateOfBirth || "",
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Manage your personal details and contact information
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} size="sm" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="mb-2 block">
              First Name
            </Label>
            {isEditing ? (
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter your first name"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">
                {formData.firstName || "Not provided"}
              </div>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="mb-2 block">
              Last Name
            </Label>
            {isEditing ? (
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter your last name"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">
                {formData.lastName || "Not provided"}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="mb-2 block">
              Email Address
            </Label>
            <div className="p-3 bg-gray-50 rounded-md text-gray-600">
              {formData.email}
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="mb-2 block">
              Phone Number (US)
            </Label>
            {isEditing ? (
              <div className="relative">
                <div className="flex items-center">
                  <span className="flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 rounded-l-md text-gray-700 text-sm">
                    +1
                  </span>
                  <Input
                    id="phone"
                    value={
                      formData.phone.length === 10
                        ? formData.phone.replace(
                            /(\d{3})(\d{3})(\d{4})/,
                            "($1) $2-$3"
                          )
                        : formData.phone
                    }
                    onChange={(e) => {
                      // Remove all non-digits
                      let value = e.target.value.replace(/\D/g, "");
                      // Limit to 10 digits
                      if (value.length > 10) value = value.slice(0, 10);
                      handleInputChange("phone", value);
                    }}
                    placeholder="(555) 123-4567"
                    type="tel"
                    maxLength={14}
                    className="rounded-l-none"
                  />
                </div>
                {formData.phone && formData.phone.length !== 10 && (
                  <p className="text-xs text-red-500 mt-1">
                    Phone number must be exactly 10 digits
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md">
                <span className="text-gray-700">+1 </span>
                <span className="text-gray-700 ml-1">
                  {formData.phone
                    ? formData.phone.replace(
                        /(\d{3})(\d{3})(\d{4})/,
                        "($1) $2-$3"
                      )
                    : "Not provided"}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              {isEditing
                ? "Enter 10-digit US phone number (area code + number)"
                : "US phone numbers only"}
            </p>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="mb-2 block">
              Gender
            </Label>
            {isEditing ? (
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-gray-50 rounded-md capitalize">
                {formData.gender || "Not provided"}
              </div>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="mb-2 block">
              Date of Birth
            </Label>
            {isEditing ? (
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                max={new Date().toISOString().split("T")[0]}
                min="1900-01-01"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">
                {formData.dateOfBirth
                  ? new Date(formData.dateOfBirth).toLocaleDateString()
                  : "Not provided"}
              </div>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-4">Account Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-green-800">Email</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Verified
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <span className="text-sm font-medium text-gray-700">Phone</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Not Verified
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-800">Account</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                {state.user?.role}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;
