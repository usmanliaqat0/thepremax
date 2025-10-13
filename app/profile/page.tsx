"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshLoader } from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { BeautifulLoader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import {
  User,
  MapPin,
  ShoppingBag,
  Settings,
  Camera,
  Shield,
  Upload,
  Trash2,
  Edit3,
  Check,
  X,
  Heart,
} from "lucide-react";

import PersonalInfoSection from "@/components/profile/PersonalInfoSection";
import AddressSection from "@/components/profile/AddressSection";
import OrderHistorySection from "@/components/profile/OrderHistorySection";
import WishlistSection from "@/components/profile/WishlistSection";
import SettingsSection from "@/components/profile/SettingsSection";

interface AvatarOption {
  id: string;
  name: string;
  src: string;
  category: "male" | "female" | "other" | "custom";
}

const Profile = () => {
  const { state, logout, updateProfile, uploadAvatar, resetAvatar } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("personal");
  const [currentAvatar, setCurrentAvatar] = useState<string>(
    "/profile-images/defaults/male-avatar.svg"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const defaultAvatars: AvatarOption[] = [
    {
      id: "male-1",
      name: "Male Avatar",
      src: "/profile-images/defaults/male-avatar.svg",
      category: "male",
    },
    {
      id: "female-1",
      name: "Female Avatar",
      src: "/profile-images/defaults/female-avatar.svg",
      category: "female",
    },
    {
      id: "other-1",
      name: "Other Avatar",
      src: "/profile-images/defaults/other-avatar.svg",
      category: "other",
    },
  ];

  useEffect(() => {
    if (!state.isAuthenticated && !state.isLoading) {
      router.push("/login");
      return;
    }

    if (state.isAuthenticated && state.user?.role === "admin") {
      router.push("/admin");
      return;
    }

    if (state.isAuthenticated && state.user && !state.user.isEmailVerified) {
      router.push(`/verify-code?email=${encodeURIComponent(state.user.email)}`);
      return;
    }
  }, [state.isAuthenticated, state.isLoading, state.user, router]);

  useEffect(() => {
    if (state.user?.avatar) {
      setCurrentAvatar(state.user.avatar);
    }
  }, [state.user?.avatar]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const success = await uploadAvatar(selectedFile);

      if (success) {
        setShowAvatarDialog(false);
        setSelectedFile(null);
        setPreviewUrl("");

        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        });
      } else {
        toast({
          title: "Upload failed",
          description: "Failed to update your avatar. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Upload failed",
        description: "Failed to update your avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDefaultAvatarSelect = async (avatar: AvatarOption) => {
    try {
      const success = await updateProfile({ avatar: avatar.src });
      if (success) {
        setCurrentAvatar(avatar.src);
        setShowAvatarDialog(false);

        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated.",
        });
      }
    } catch {
      toast({
        title: "Update failed",
        description: "Failed to update your avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const success = await resetAvatar();
      if (success) {
        setCurrentAvatar("/profile-images/defaults/male-avatar.svg");

        toast({
          title: "Avatar removed",
          description: "Your profile picture has been reset to default.",
        });
      }
    } catch {
      toast({
        title: "Reset failed",
        description: "Failed to reset your avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <BeautifulLoader size="lg" variant="default" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!state.user) {
    return null;
  }

  const tabsData = [
    {
      id: "personal",
      label: "Personal Info",
      icon: User,
      description: "Manage your personal information",
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: MapPin,
      description: "Manage shipping and billing addresses",
    },
    {
      id: "orders",
      label: "Order History",
      icon: ShoppingBag,
      description: "View your order history and tracking",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      icon: Heart,
      description: "Manage your favorite items",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Account preferences and security",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {}
      <EmailVerificationBanner />

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-7xl">
        {}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 ring-4 ring-gray-100">
                  <AvatarImage src={currentAvatar} />
                  <AvatarFallback className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {state.user
                      ? `${state.user.firstName?.[0] || ""}${
                          state.user.lastName?.[0] || ""
                        }`
                      : "UN"}
                  </AvatarFallback>
                </Avatar>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 rounded-full w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 p-0"
                    >
                      <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowAvatarDialog(true)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Change Picture
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleRemoveAvatar}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Picture
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className="text-center sm:text-left flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 truncate">
                  {state.user
                    ? `${state.user.firstName || ""} ${
                        state.user.lastName || ""
                      }`.trim() || "User Name"
                    : "User Name"}
                </h1>
                <p className="text-gray-600 mb-3 text-xs sm:text-sm md:text-base truncate">
                  {state.user?.email}
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 capitalize"
                  >
                    {state.user?.role || "Customer"}
                  </Badge>
                </div>
              </div>

              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shrink-0 w-full sm:w-auto"
              >
                <span className="text-sm">Logout</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-3 sm:space-y-4"
        >
          <div className="bg-white rounded-xl border shadow-sm p-1">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex h-auto w-full min-w-max bg-transparent gap-1 p-0">
                {tabsData.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center justify-center space-y-1 p-2 sm:p-3 min-w-[60px] sm:min-w-[80px] flex-1 rounded-lg border border-transparent transition-all duration-200 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="text-xs font-medium leading-none whitespace-nowrap">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {}
          <TabsContent value="personal" className="space-y-4">
            <PersonalInfoSection />
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <AddressSection />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrderHistorySection />
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-4">
            <WishlistSection />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsSection />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <h4 className="font-medium">Upload Custom Picture</h4>

            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={previewUrl} alt="Preview" />
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-sm text-gray-600 text-center">
                  {selectedFile.name} (
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <RefreshLoader size="sm" className="mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={cancelUpload}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Click to upload a photo
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}

            {!selectedFile && (
              <div className="space-y-4">
                <h4 className="font-medium">Choose Default Avatar</h4>

                <div className="grid grid-cols-3 gap-4">
                  {defaultAvatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`cursor-pointer rounded-lg p-3 border-2 transition-all ${
                        currentAvatar === avatar.src
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleDefaultAvatarSelect(avatar)}
                    >
                      <Avatar className="w-16 h-16 mx-auto mb-2">
                        <AvatarImage src={avatar.src} alt={avatar.name} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-center text-gray-600">
                        {avatar.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
