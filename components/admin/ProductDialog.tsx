"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price?: number;
  images?: string[];
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  categoryId: string;
  tags: string[];
  variants: ProductVariant[];
  images: ProductImage[];
  totalSold: number;
  featured: boolean;
  topRated: boolean;
  onSale: boolean;
  status: "active" | "inactive" | "pending" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  rating: number;
  reviewCount: number;
  specifications?: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
  onSuccess: () => void;
}

export default function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSuccess,
}: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: 0,
    compareAtPrice: 0,
    categoryId: "",
    tags: [] as string[],
    variants: [] as ProductVariant[],
    images: [] as ProductImage[],
    totalSold: 0,
    featured: false,
    topRated: false,
    onSale: false,
    status: "active" as "active" | "inactive" | "pending" | "archived",
    seoTitle: "",
    seoDescription: "",
    rating: 0,
    reviewCount: 0,
    specifications: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    inStock: true,
    sourceUrl: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newSpec, setNewSpec] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          name: product.name || "",
          description: product.description || "",
          basePrice: product.basePrice || 0,
          compareAtPrice: product.compareAtPrice || 0,
          categoryId: product.categoryId || "",
          tags: product.tags || [],
          variants: product.variants || [],
          images: product.images || [],
          totalSold: product.totalSold || 0,
          featured: product.featured || false,
          topRated: product.topRated || false,
          onSale: product.onSale || false,
          status: product.status || "active",
          seoTitle: product.seoTitle || "",
          seoDescription: product.seoDescription || "",
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          specifications: product.specifications || [],
          sizes: product.sizes || [],
          colors: product.colors || [],
          inStock: product.inStock !== undefined ? product.inStock : true,
          sourceUrl: product.sourceUrl || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
          basePrice: 0,
          compareAtPrice: 0,
          categoryId: "",
          tags: [],
          variants: [],
          images: [],
          totalSold: 0,
          featured: false,
          topRated: false,
          onSale: false,
          status: "active",
          seoTitle: "",
          seoDescription: "",
          rating: 0,
          reviewCount: 0,
          specifications: [],
          sizes: [],
          colors: [],
          inStock: true,
          sourceUrl: "",
        });
      }
    }
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = product
        ? `/api/admin/products/${product._id}`
        : "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          product
            ? "Product updated successfully"
            : "Product created successfully"
        );
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(data.error || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[] | ProductImage[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange("tags", [...formData.tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const addSpecification = () => {
    if (newSpec.trim() && !formData.specifications.includes(newSpec.trim())) {
      handleInputChange("specifications", [
        ...formData.specifications,
        newSpec.trim(),
      ]);
      setNewSpec("");
    }
  };

  const removeSpecification = (specToRemove: string) => {
    handleInputChange(
      "specifications",
      formData.specifications.filter((spec) => spec !== specToRemove)
    );
  };

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      handleInputChange("sizes", [...formData.sizes, newSize.trim()]);
      setNewSize("");
    }
  };

  const removeSize = (sizeToRemove: string) => {
    handleInputChange(
      "sizes",
      formData.sizes.filter((size) => size !== sizeToRemove)
    );
  };

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      handleInputChange("colors", [...formData.colors, newColor.trim()]);
      setNewColor("");
    }
  };

  const removeColor = (colorToRemove: string) => {
    handleInputChange(
      "colors",
      formData.colors.filter((color) => color !== colorToRemove)
    );
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("folder", "products");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();

      if (data.success) {
        // Add the uploaded image to the images array
        const newImage = {
          id: Date.now().toString(),
          url: data.data.url,
          alt: file.name,
          isPrimary: formData.images.length === 0, // First image is primary
          order: formData.images.length,
        };

        handleInputChange("images", [...formData.images, newImage]);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (imageId: string) => {
    const updatedImages = formData.images.filter((img) => img.id !== imageId);
    // If we removed the primary image, make the first remaining image primary
    if (
      updatedImages.length > 0 &&
      !updatedImages.some((img) => img.isPrimary)
    ) {
      updatedImages[0].isPrimary = true;
    }
    handleInputChange("images", updatedImages);
  };

  const setPrimaryImage = (imageId: string) => {
    const updatedImages = formData.images.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
    handleInputChange("images", updatedImages);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Create New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Product description"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) =>
                    handleInputChange(
                      "basePrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare At Price</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compareAtPrice}
                  onChange={(e) =>
                    handleInputChange(
                      "compareAtPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Category and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Category & Status</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    handleInputChange("categoryId", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tags</h3>

            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Specifications</h3>

            <div className="flex gap-2">
              <Input
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                placeholder="Add specification"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSpecification())
                }
              />
              <Button type="button" onClick={addSpecification} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.specifications.length > 0 && (
              <div className="space-y-2">
                {formData.specifications.map((spec) => (
                  <div
                    key={spec}
                    className="flex items-center gap-2 bg-muted px-2 py-1 rounded text-sm"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecification(spec)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sizes and Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sizes & Colors</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sizes</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Add size"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSize())
                    }
                  />
                  <Button type="button" onClick={addSize} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.sizes.map((size) => (
                      <div
                        key={size}
                        className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Colors</Label>
                <div className="flex gap-2">
                  <Input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Add color"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addColor())
                    }
                  />
                  <Button type="button" onClick={addColor} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.colors.map((color) => (
                      <div
                        key={color}
                        className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Images</h3>

            <div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="default" className="text-xs">
                            Primary
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setPrimaryImage(image.id)}
                        disabled={image.isPrimary}
                      >
                        {image.isPrimary ? "Primary" : "Set Primary"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Flags</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    handleInputChange("featured", checked)
                  }
                />
                <Label htmlFor="featured">Featured</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="topRated"
                  checked={formData.topRated}
                  onCheckedChange={(checked) =>
                    handleInputChange("topRated", checked)
                  }
                />
                <Label htmlFor="topRated">Top Rated</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="onSale"
                  checked={formData.onSale}
                  onCheckedChange={(checked) =>
                    handleInputChange("onSale", checked)
                  }
                />
                <Label htmlFor="onSale">On Sale</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) =>
                    handleInputChange("inStock", checked)
                  }
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">SEO Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => handleInputChange("seoTitle", e.target.value)}
                placeholder="SEO title (max 60 characters)"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">
                {formData.seoTitle.length}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={(e) =>
                  handleInputChange("seoDescription", e.target.value)
                }
                placeholder="SEO description (max 160 characters)"
                maxLength={160}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {formData.seoDescription.length}/160 characters
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
