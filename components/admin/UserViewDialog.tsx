"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User } from "@/lib/types";
import { WishlistItem } from "@/context/WishlistContext";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  User as UserIcon,
  Settings,
  Star,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { formatPrice } from "@/lib/currency";
import Image from "next/image";

interface UserViewDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserViewDialog({
  user,
  open,
  onOpenChange,
}: UserViewDialogProps) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const fetchUserWishlist = useCallback(async () => {
    try {
      setWishlistLoading(true);
      const token = localStorage.getItem("auth_token");

      if (!token) return;

      const response = await fetch(
        `/api/admin/user-wishlist?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setWishlist(result.wishlist?.items || []);
      }
    } catch (error) {
      console.error("Error fetching user wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (open && user.id) {
      fetchUserWishlist();
    }
  }, [open, user.id, fetchUserWishlist]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg">
                {user.firstName.charAt(0)}
                {user.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={user.status === "active" ? "default" : "secondary"}
                >
                  {user.status}
                </Badge>
                <Badge
                  variant={user.role === "admin" ? "destructive" : "outline"}
                >
                  {user.role}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2">
                Member since {format(new Date(user.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{user.email}</span>
                  {user.isEmailVerified && (
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{user.phone}</span>
                    {user.isPhoneVerified && (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Personal Information
              </h4>
              <div className="space-y-2 text-sm">
                {user.gender && (
                  <div>
                    <span className="text-muted-foreground">Gender: </span>
                    <span className="capitalize">{user.gender}</span>
                  </div>
                )}
                {user.dateOfBirth && (
                  <div>
                    <span className="text-muted-foreground">
                      Date of Birth:{" "}
                    </span>
                    <span>
                      {format(new Date(user.dateOfBirth), "MMMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4" />
              Preferences
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Currency</span>
                <span className="font-medium">{user.preferences.currency}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Language</span>
                <span className="font-medium">{user.preferences.language}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Theme</span>
                <span className="font-medium capitalize">
                  {user.preferences.theme}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Categories</span>
                <span className="font-medium">
                  {user.preferences.favoriteCategories.length}
                </span>
              </div>
            </div>
          </div>

          {user.preferences.favoriteCategories.length > 0 && (
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4" />
                Favorite Categories
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.preferences.favoriteCategories.map((category) => (
                  <Badge key={category} variant="outline">
                    {category.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {user.addresses.length > 0 && (
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" />
                Addresses ({user.addresses.length})
              </h4>
              <div className="space-y-3">
                {user.addresses.map((address) => (
                  <div
                    key={address.id}
                    className="border border-border rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          address.type === "shipping" ? "default" : "secondary"
                        }
                      >
                        {address.type}
                      </Badge>
                      {address.isDefault && (
                        <Badge variant="outline">Default</Badge>
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="font-medium">
                        {address.firstName} {address.lastName}
                      </div>
                      <div>{address.address}</div>
                      <div>
                        {address.city}, {address.state} {address.postalCode}
                      </div>
                      <div>{address.country}</div>
                      {address.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {address.phone}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wishlist Section */}
          <div>
            <h4 className="font-semibold flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4" />
              Wishlist ({wishlist.length} items)
            </h4>
            {wishlistLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading wishlist...
              </div>
            ) : wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {wishlist.map((item) => (
                  <Card key={item.productId} className="p-3">
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h5>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-primary">
                            {formatPrice(item.price)}
                          </span>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{item.rating}</span>
                            <span>({item.reviewCount})</span>
                          </div>
                          <Badge
                            variant={item.inStock ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {item.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Added{" "}
                          {format(new Date(item.dateAdded), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No items in wishlist</p>
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Account Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Created</span>
                <span>
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">
                  Last Updated
                </span>
                <span>
                  {formatDistanceToNow(new Date(user.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
