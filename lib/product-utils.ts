import { Product } from "./products";

/**
 * Product utility functions for enhanced functionality
 */

export type SortOption =
  | "name"
  | "price-low"
  | "price-high"
  | "featured"
  | "newest"
  | "popular";

export type FilterOptions = {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
  topRated?: boolean;
};

/**
 * Search products by name, description, or category
 */
export function searchProducts(
  products: Product[],
  searchTerm: string
): Product[] {
  if (!searchTerm.trim()) return products;

  const lowercaseSearch = searchTerm.toLowerCase().trim();

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseSearch) ||
      product.description.toLowerCase().includes(lowercaseSearch) ||
      product.category.toLowerCase().includes(lowercaseSearch) ||
      product.colors.some((color) =>
        color.toLowerCase().includes(lowercaseSearch)
      ) ||
      product.sizes.some((size) => size.toLowerCase().includes(lowercaseSearch))
  );
}

/**
 * Filter products based on multiple criteria
 */
export function filterProducts(
  products: Product[],
  filters: FilterOptions
): Product[] {
  return products.filter((product) => {
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (product.price < min || product.price > max) {
        return false;
      }
    }

    // Size filter
    if (filters.sizes && filters.sizes.length > 0) {
      if (!filters.sizes.some((size) => product.sizes.includes(size))) {
        return false;
      }
    }

    // Color filter
    if (filters.colors && filters.colors.length > 0) {
      if (!filters.colors.some((color) => product.colors.includes(color))) {
        return false;
      }
    }

    // Stock filter
    if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
      return false;
    }

    // Sale filter
    if (filters.onSale !== undefined && product.sale !== filters.onSale) {
      return false;
    }

    // Featured filter
    if (
      filters.featured !== undefined &&
      product.featured !== filters.featured
    ) {
      return false;
    }

    // Top rated filter
    if (
      filters.topRated !== undefined &&
      product.topRated !== filters.topRated
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Sort products by specified criteria
 */
export function sortProducts(
  products: Product[],
  sortBy: SortOption
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);

    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);

    case "featured":
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      });

    case "newest":
      // Assuming newer products have higher IDs (you might want to add a createdAt field)
      return sorted.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    case "popular":
      // Sort by featured and top rated first, then by name
      return sorted.sort((a, b) => {
        const aScore = (a.featured ? 2 : 0) + (a.topRated ? 1 : 0);
        const bScore = (b.featured ? 2 : 0) + (b.topRated ? 1 : 0);
        if (aScore !== bScore) return bScore - aScore;
        return a.name.localeCompare(b.name);
      });

    default:
      return sorted;
  }
}

/**
 * Get available filter values from a product array
 */
export function getAvailableFilters(products: Product[]) {
  const categories = [...new Set(products.map((p) => p.category))];
  const sizes = [...new Set(products.flatMap((p) => p.sizes))];
  const colors = [...new Set(products.flatMap((p) => p.colors))];

  const priceRange = {
    min: Math.min(...products.map((p) => p.price)),
    max: Math.max(...products.map((p) => p.price)),
  };

  return {
    categories: categories.sort(),
    sizes: sizes.sort(),
    colors: colors.sort(),
    priceRange,
  };
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercentage(
  price: number,
  originalPrice?: number
): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Check if product has discount
 */
export function hasDiscount(product: Product): boolean {
  return !!(product.originalPrice && product.originalPrice > product.price);
}

/**
 * Get product badges
 */
export function getProductBadges(product: Product) {
  const badges = [];

  if (product.sale || hasDiscount(product)) {
    badges.push({
      text: hasDiscount(product)
        ? `${getDiscountPercentage(product.price, product.originalPrice)}% OFF`
        : "SALE",
      variant: "destructive" as const,
    });
  }

  if (product.featured) {
    badges.push({
      text: "FEATURED",
      variant: "accent" as const,
    });
  }

  if (product.topRated) {
    badges.push({
      text: "⭐ TOP RATED",
      variant: "secondary" as const,
    });
  }

  if (!product.inStock) {
    badges.push({
      text: "OUT OF STOCK",
      variant: "outline" as const,
    });
  }

  return badges;
}

/**
 * Combine search, filter, and sort operations
 */
export function processProducts(
  products: Product[],
  searchTerm?: string,
  filters?: FilterOptions,
  sortBy: SortOption = "name"
): Product[] {
  let result = [...products];

  // Apply search
  if (searchTerm) {
    result = searchProducts(result, searchTerm);
  }

  // Apply filters
  if (filters) {
    result = filterProducts(result, filters);
  }

  // Apply sorting
  result = sortProducts(result, sortBy);

  return result;
}

/**
 * Get related products (same category, excluding current product)
 */
export function getRelatedProducts(
  products: Product[],
  currentProduct: Product,
  limit = 4
): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== currentProduct.id && p.category === currentProduct.category
    )
    .slice(0, limit);
}

/**
 * Get recently viewed products (this would typically use localStorage or user data)
 */
export function getRecentlyViewed(
  productIds: string[],
  allProducts: Product[]
): Product[] {
  return productIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((product): product is Product => product !== undefined);
}
