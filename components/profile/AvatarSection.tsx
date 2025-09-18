"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Upload,
  Camera,
  Trash2,
  RefreshCw,
  User,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AvatarOption {
  id: string;
  name: string;
  src: string;
  category: "male" | "female" | "other" | "custom";
}

const AvatarSection = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, you would upload to your server here
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      // For now, we'll use the preview URL
      setCurrentAvatar(previewUrl);
      setShowAvatarDialog(false);
      setSelectedFile(null);
      setPreviewUrl("");

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to update your avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDefaultAvatarSelect = (avatar: AvatarOption) => {
    setCurrentAvatar(avatar.src);
    setShowAvatarDialog(false);

    toast({
      title: "Avatar updated",
      description: "Your profile picture has been updated.",
    });
  };

  const handleRemoveAvatar = () => {
    setCurrentAvatar("/profile-images/defaults/male-avatar.svg");

    toast({
      title: "Avatar removed",
      description: "Your profile picture has been reset to default.",
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Profile Picture</span>
          </CardTitle>
          <CardDescription>
            Upload a photo or choose from our default avatars
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {/* Current Avatar Display */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative mx-auto sm:mx-0">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 ring-4 ring-gray-100">
                <AvatarImage src={currentAvatar} alt="Profile picture" />
                <AvatarFallback className="text-xl sm:text-2xl">
                  <User className="w-12 h-12 sm:w-16 sm:h-16" />
                </AvatarFallback>
              </Avatar>

              <Dialog
                open={showAvatarDialog}
                onOpenChange={setShowAvatarDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>
                      Upload a new photo or choose from default avatars
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Upload Section */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Upload Custom Picture</h4>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

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
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Default Avatars */}
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
                                <AvatarImage
                                  src={avatar.src}
                                  alt={avatar.name}
                                />
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

            <div className="text-center sm:text-left flex-1">
              <p className="text-sm text-gray-600 mb-3">
                Your profile picture is visible to other users
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAvatarDialog(true)}
                  className="flex-1 sm:flex-none"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Picture
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  Privacy Information
                </h4>
                <p className="text-sm text-blue-700">
                  Your profile picture visibility depends on your privacy
                  settings. You can control who can see your profile picture in
                  the Privacy Settings section.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvatarSection;
