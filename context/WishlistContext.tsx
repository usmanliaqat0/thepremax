"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Product } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface WishlistItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  inStock: boolean;
  discount?: number;
  size?: string;
  color?: string;
  dateAdded: Date;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  isInitialized: boolean;
}

type WishlistAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_WISHLIST"; payload: WishlistItem[] }
  | { type: "ADD_ITEM"; payload: WishlistItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_WISHLIST" }
  | { type: "INITIALIZE" };

interface WishlistContextType {
  state: WishlistState;
  addToWishlist: (
    product: Product,
    size?: string,
    color?: string
  ) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  moveToCart: (productId: string, size?: string, color?: string) => void;
}

const wishlistReducer = (
  state: WishlistState,
  action: WishlistAction
): WishlistState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_WISHLIST":
      return {
        ...state,
        items: action.payload,
        isLoading: false,
        isInitialized: true,
      };

    case "ADD_ITEM":
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (existingItem) {
        return state; // Item already exists
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.payload),
      };

    case "CLEAR_WISHLIST":
      return {
        ...state,
        items: [],
      };

    case "INITIALIZE":
      return {
        ...state,
        isInitialized: true,
        isLoading: false,
      };

    default:
      return state;
  }
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  isInitialized: false,
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { state: authState } = useAuth();

  // Convert Product to WishlistItem
  const productToWishlistItem = useCallback(
    (product: Product, size?: string, color?: string): WishlistItem => {
      // Handle image - extract URL from image object or use string
      let imageUrl = "";
      if (product.images && product.images.length > 0) {
        imageUrl =
          typeof product.images[0] === "string"
            ? product.images[0]
            : product.images[0]?.url || "";
      }

      // Handle category - extract name from category object or use string
      let categoryName = "";
      if (typeof product.category === "string") {
        categoryName = product.category;
      } else if (product.category?.name) {
        categoryName = product.category.name;
      }

      return {
        productId: product._id,
        name: product.name,
        image: imageUrl,
        price: product.basePrice || 0,
        originalPrice: product.compareAtPrice,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        category: categoryName,
        inStock: product.inStock !== false,
        size,
        color,
        dateAdded: new Date(),
      };
    },
    []
  );

  // Fetch wishlist from database
  const fetchWishlist = useCallback(async () => {
    if (!authState.token || !authState.isAuthenticated) {
      dispatch({ type: "INITIALIZE" });
      return;
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch("/api/profile/wishlist", {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        dispatch({
          type: "SET_WISHLIST",
          payload: result.wishlist?.items || [],
        });
      } else {
        console.error("Failed to fetch wishlist:", result.message);
        dispatch({ type: "SET_WISHLIST", payload: [] });
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      dispatch({ type: "SET_WISHLIST", payload: [] });
    }
  }, [authState.token, authState.isAuthenticated]);

  // Sync wishlist to database
  const syncToDatabase = useCallback(
    async (
      action: "add" | "remove",
      item?: WishlistItem,
      productId?: string
    ) => {
      if (!authState.token || !authState.isAuthenticated) {
        return;
      }

      try {
        const response = await fetch("/api/profile/wishlist", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authState.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            item,
            productId,
          }),
        });

        const result = await response.json();

        if (!result.success) {
          console.error("Failed to sync wishlist:", result.message);
          throw new Error(result.message || "Failed to sync wishlist");
        }
      } catch (error) {
        console.error("Error syncing wishlist:", error);
        throw error;
      }
    },
    [authState.token, authState.isAuthenticated]
  );

  // Add item to wishlist
  const addToWishlist = useCallback(
    async (product: Product, size?: string, color?: string) => {
      const wishlistItem = productToWishlistItem(product, size, color);

      // Add to local state immediately for better UX
      dispatch({ type: "ADD_ITEM", payload: wishlistItem });

      // Show success message
      toast.success(`${product.name} added to wishlist!`);

      // Sync to database if user is authenticated
      if (authState.isAuthenticated) {
        try {
          await syncToDatabase("add", wishlistItem);
        } catch (error) {
          // Revert local state on error
          dispatch({ type: "REMOVE_ITEM", payload: product._id });
          toast.error("Failed to add to wishlist. Please try again.");
          return;
        }
      }
    },
    [productToWishlistItem, authState.isAuthenticated, syncToDatabase]
  );

  // Remove item from wishlist
  const removeFromWishlist = useCallback(
    async (productId: string) => {
      // Remove from local state immediately
      dispatch({ type: "REMOVE_ITEM", payload: productId });

      // Show success message
      const item = state.items.find((item) => item.productId === productId);
      if (item) {
        toast.success(`${item.name} removed from wishlist`);
      }

      // Sync to database if user is authenticated
      if (authState.isAuthenticated) {
        try {
          await syncToDatabase("remove", undefined, productId);
        } catch (error) {
          // Revert local state on error
          await fetchWishlist();
          toast.error("Failed to remove from wishlist. Please try again.");
          return;
        }
      }
    },
    [state.items, authState.isAuthenticated, syncToDatabase, fetchWishlist]
  );

  // Check if item is in wishlist
  const isInWishlist = useCallback(
    (productId: string) => {
      return state.items.some((item) => item.productId === productId);
    },
    [state.items]
  );

  // Clear wishlist
  const clearWishlist = useCallback(async () => {
    dispatch({ type: "CLEAR_WISHLIST" });
    toast.success("Wishlist cleared");

    // Sync to database if user is authenticated
    if (authState.isAuthenticated) {
      try {
        // Remove all items one by one
        for (const item of state.items) {
          await syncToDatabase("remove", undefined, item.productId);
        }
      } catch (error) {
        // Revert local state on error
        await fetchWishlist();
        toast.error("Failed to clear wishlist. Please try again.");
        return;
      }
    }
  }, [state.items, authState.isAuthenticated, syncToDatabase, fetchWishlist]);

  // Refresh wishlist from database
  const refreshWishlist = useCallback(async () => {
    await fetchWishlist();
  }, [fetchWishlist]);

  // Move item to cart (placeholder - would need cart context integration)
  const moveToCart = useCallback(
    (productId: string, size?: string, color?: string) => {
      // This would integrate with CartContext
      // For now, just show a message
      toast.info("Move to cart functionality would be implemented here");
    },
    []
  );

  // Load wishlist when user logs in
  useEffect(() => {
    if (authState.isAuthenticated && !state.isInitialized) {
      fetchWishlist();
    } else if (!authState.isAuthenticated) {
      // Clear wishlist when user logs out
      dispatch({ type: "CLEAR_WISHLIST" });
      dispatch({ type: "INITIALIZE" });
    }
  }, [authState.isAuthenticated, state.isInitialized, fetchWishlist]);

  const contextValue: WishlistContextType = {
    state,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    refreshWishlist,
    moveToCart,
  };

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
