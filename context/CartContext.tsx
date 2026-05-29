"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface CartItem {
  name:        string;
  description: string;
  price:       number;
  isVeg:       boolean;
  quantity:    number;
}

interface CartContextValue {
  items:       CartItem[];
  addItem:     (item: Omit<CartItem, "quantity">) => void;
  removeItem:  (name: string) => void;
  clearCart:   () => void;
  totalCount:  number;
}

const STORAGE_KEY = "kasoori_cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Hydrate from localStorage on first render (client only)
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or blocked — silently ignore
    }
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((name: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((i) => i.name !== name);
      return prev.map((i) =>
        i.name === name ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}