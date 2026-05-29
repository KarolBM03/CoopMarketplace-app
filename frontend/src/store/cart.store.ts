import { create } from "zustand";
import type { Product } from "../types/product.types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

const saveCart = (items: CartItem[]) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const sanitizeQuantity = (quantity: number, stock?: number) => {
  const max = Math.max(1, Number(stock || 1));
  return Math.min(Math.max(1, Math.floor(Number(quantity) || 1)), max);
};

export const useCartStore = create<CartState>((set, get) => ({
  items: JSON.parse(localStorage.getItem("cart") || "[]").filter(
    (item: CartItem) => item?.product?.id && item.quantity > 0,
  ),

  addToCart: (product) => {
    const items = get().items;
    const existing = items.find((item) => item.product.id === product.id);

    let newItems;

    if (existing) {
      newItems = items.map((item) =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: sanitizeQuantity(item.quantity + 1, item.product.stock),
            }
          : item,
      );
    } else {
      newItems = [...items, { product, quantity: 1 }];
    }

    saveCart(newItems);
    set({ items: newItems });
  },

  removeFromCart: (productId) => {
    const newItems = get().items.filter(
      (item) => item.product.id !== productId,
    );

    saveCart(newItems);
    set({ items: newItems });
  },

  updateQuantity: (productId, quantity) => {
    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      get().removeFromCart(productId);
      return;
    }

    const newItems = get().items.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: sanitizeQuantity(quantity, item.product.stock) }
        : item,
    );

    saveCart(newItems);
    set({ items: newItems });
  },

  clearCart: () => {
    localStorage.removeItem("cart");
    set({ items: [] });
  },

  total: () => {
    return get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  },
}));
