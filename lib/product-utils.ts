import { Product } from "./types";

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
      product.category?.name.toLowerCase().includes(lowercaseSearch) ||
      product.colors.some((color) =>
        color.toLowerCase().includes(lowercaseSearch)
      ) ||
      product.sizes.some((size) => size.toLowerCase().includes(lowercaseSearch))
  );
}

export function filterProducts(
  products: Product[],
  filters: FilterOptions
): Product[] {
  return products.filter((product) => {
    if (filters.category && product.categoryId !== filters.category) {
      return false;
    }

    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (product.basePrice < min || product.basePrice > max) {
        return false;
      }
    }

    if (filters.sizes && filters.sizes.length > 0) {
      if (!filters.sizes.some((size) => product.sizes.includes(size))) {
        return false;
      }
    }

    if (filters.colors && filters.colors.length > 0) {
      if (!filters.colors.some((color) => product.colors.includes(color))) {
        return false;
      }
    }

    if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
      return false;
    }

    if (filters.onSale !== undefined && product.onSale !== filters.onSale) {
      return false;
    }

    if (
      filters.featured !== undefined &&
      product.featured !== filters.featured
    ) {
      return false;
    }

    if (
      filters.topRated !== undefined &&
      product.topRated !== filters.topRated
    ) {
      return false;
    }

    return true;
  });
}

export function sortProducts(
  products: Product[],
  sortBy: SortOption
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));

    case "price-low":
      return sorted.sort((a, b) => a.basePrice - b.basePrice);

    case "price-high":
      return sorted.sort((a, b) => b.basePrice - a.basePrice);

    case "featured":
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      });

    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case "popular":
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

export function getAvailableFilters(products: Product[]) {
  const categories = [
    ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
  ];
  const sizes = [...new Set(products.flatMap((p) => p.sizes))];
  const colors = [...new Set(products.flatMap((p) => p.colors))];

  const priceRange = {
    min: Math.min(...products.map((p) => p.basePrice)),
    max: Math.max(...products.map((p) => p.basePrice)),
  };

  return {
    categories: categories.sort(),
    sizes: sizes.sort(),
    colors: colors.sort(),
    priceRange,
  };
}

export function getDiscountPercentage(
  price: number,
  originalPrice?: number
): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function hasDiscount(product: Product): boolean {
  return !!(
    product.compareAtPrice && product.compareAtPrice > product.basePrice
  );
}

export function getProductBadges(product: Product) {
  const badges = [];

  if (product.onSale || hasDiscount(product)) {
    badges.push({
      text: hasDiscount(product)
        ? `${getDiscountPercentage(
            product.basePrice,
            product.compareAtPrice
          )}% OFF`
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

export function processProducts(
  products: Product[],
  searchTerm?: string,
  filters?: FilterOptions,
  sortBy: SortOption = "name"
): Product[] {
  let result = [...products];

  if (searchTerm) {
    result = searchProducts(result, searchTerm);
  }

  if (filters) {
    result = filterProducts(result, filters);
  }

  result = sortProducts(result, sortBy);

  return result;
}

export function getRelatedProducts(
  products: Product[],
  currentProduct: Product,
  limit = 4
): Product[] {
  return products
    .filter(
      (p) =>
        p._id !== currentProduct._id &&
        p.categoryId === currentProduct.categoryId
    )
    .slice(0, limit);
}

export function getRecentlyViewed(
  productIds: string[],
  allProducts: Product[]
): Product[] {
  return productIds
    .map((id) => allProducts.find((p) => p._id === id))
    .filter((product): product is Product => product !== undefined);
}
