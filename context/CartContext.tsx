"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Product } from "@/lib/products";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface WishlistItem {
  id: string;
  product: Product;
}

interface CartState {
  items: CartItem[];
  wishlist: WishlistItem[];
}

type CartAction =
  | {
      type: "ADD_TO_CART";
      payload: {
        product: Product;
        size: string;
        color: string;
        quantity?: number;
      };
    }
  | {
      type: "REMOVE_FROM_CART";
      payload: { id: string; size: string; color: string };
    }
  | {
      type: "UPDATE_QUANTITY";
      payload: { id: string; size: string; color: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "ADD_TO_WISHLIST"; payload: { product: Product } }
  | { type: "REMOVE_FROM_WISHLIST"; payload: { id: string } }
  | { type: "CLEAR_WISHLIST" }
  | {
      type: "MOVE_TO_CART";
      payload: { product: Product; size: string; color: string };
    }
  | { type: "LOAD_STATE"; payload: CartState };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const { product, size, color, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.id === product.id && item.size === size && item.color === color
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        return { ...state, items: updatedItems };
      } else {
        const newItem: CartItem = {
          id: product.id,
          product,
          quantity,
          size,
          color,
        };
        return { ...state, items: [...state.items, newItem] };
      }
    }

    case "REMOVE_FROM_CART": {
      const { id, size, color } = action.payload;
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(item.id === id && item.size === size && item.color === color)
        ),
      };
    }

    case "UPDATE_QUANTITY": {
      const { id, size, color, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) =>
              !(item.id === id && item.size === size && item.color === color)
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id && item.size === size && item.color === color
            ? { ...item, quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "ADD_TO_WISHLIST": {
      const { product } = action.payload;
      const existingItem = state.wishlist.find(
        (item) => item.id === product.id
      );
      if (existingItem) {
        return state;
      }
      const newWishlistItem: WishlistItem = {
        id: product.id,
        product,
      };
      return { ...state, wishlist: [...state.wishlist, newWishlistItem] };
    }

    case "REMOVE_FROM_WISHLIST": {
      const { id } = action.payload;
      return {
        ...state,
        wishlist: state.wishlist.filter((item) => item.id !== id),
      };
    }

    case "CLEAR_WISHLIST":
      return { ...state, wishlist: [] };

    case "MOVE_TO_CART": {
      const { product, size, color } = action.payload;
      const updatedWishlist = state.wishlist.filter(
        (item) => item.id !== product.id
      );
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.id === product.id && item.size === size && item.color === color
      );

      let updatedItems = [...state.items];
      if (existingItemIndex >= 0) {
        updatedItems[existingItemIndex].quantity += 1;
      } else {
        const newItem: CartItem = {
          id: product.id,
          product,
          quantity: 1,
          size,
          color,
        };
        updatedItems.push(newItem);
      }

      return { ...state, items: updatedItems, wishlist: updatedWishlist };
    }

    case "LOAD_STATE":
      return action.payload;

    default:
      return state;
  }
};

interface CartContextValue {
  state: CartState;
  addToCart: (
    product: Product,
    size: string,
    color: string,
    quantity?: number
  ) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (
    id: string,
    size: string,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  moveToCart: (product: Product, size: string, color: string) => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  isInCart: (id: string, size?: string, color?: string) => boolean;
  isInWishlist: (id: string) => boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const initialState: CartState = {
  items: [],
  wishlist: [],
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("fashionmisst-cart");
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: "LOAD_STATE", payload: parsedState });
      } catch (error) {
        console.error("Error loading cart state from localStorage:", error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("fashionmisst-cart", JSON.stringify(state));
  }, [state]);

  // Memoized callback functions for better performance
  const addToCart = useCallback(
    (product: Product, size: string, color: string, quantity = 1) => {
      dispatch({
        type: "ADD_TO_CART",
        payload: { product, size, color, quantity },
      });
      toast.success(`${product.name} added to cart!`, {
        description: `Size: ${size}, Color: ${color}`,
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (id: string, size: string, color: string) => {
      dispatch({ type: "REMOVE_FROM_CART", payload: { id, size, color } });
      toast.success("Item removed from cart");
    },
    []
  );

  const updateQuantity = useCallback(
    (id: string, size: string, color: string, quantity: number) => {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { id, size, color, quantity },
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
    toast.success("Cart cleared");
  }, []);

  const addToWishlist = useCallback((product: Product) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: { product } });
    toast.success(`${product.name} added to wishlist!`);
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: { id } });
    toast.success("Item removed from wishlist");
  }, []);

  const clearWishlist = useCallback(() => {
    dispatch({ type: "CLEAR_WISHLIST" });
    toast.success("Wishlist cleared");
  }, []);

  const moveToCart = useCallback(
    (product: Product, size: string, color: string) => {
      dispatch({ type: "MOVE_TO_CART", payload: { product, size, color } });
      toast.success(`${product.name} moved to cart!`);
    },
    []
  );

  // Memoized expensive calculations
  const cartTotal = useMemo(() => {
    return state.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }, [state.items]);

  const cartItemsCount = useMemo(() => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  }, [state.items]);

  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);
  const getCartItemsCount = useCallback(() => cartItemsCount, [cartItemsCount]);

  const isInCart = useCallback(
    (id: string, size?: string, color?: string) => {
      if (size && color) {
        return state.items.some(
          (item) => item.id === id && item.size === size && item.color === color
        );
      }
      return state.items.some((item) => item.id === id);
    },
    [state.items]
  );

  const isInWishlist = useCallback(
    (id: string) => {
      return state.wishlist.some((item) => item.id === id);
    },
    [state.wishlist]
  );

  const value: CartContextValue = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    isInWishlist,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
