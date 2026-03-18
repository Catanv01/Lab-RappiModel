import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  storeId: string | null;
  addItem: (item: CartItem, storeId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [storeId, setStoreId] = useState<string | null>(() => {
    return localStorage.getItem('cart_storeId');
  });

  // Guarda en localStorage cada vez que cambia el carrito
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (storeId) {
      localStorage.setItem('cart_storeId', storeId);
    } else {
      localStorage.removeItem('cart_storeId');
    }
  }, [storeId]);

  const addItem = (item: CartItem, newStoreId: string) => {
    if (storeId && storeId !== newStoreId) {
      setItems([item]);
      setStoreId(newStoreId);
      return;
    }

    setStoreId(newStoreId);

    const existing = items.find((i) => i.productId === item.productId);
    if (existing) {
      setItems(items.map((i) =>
        i.productId === item.productId
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setItems([...items, item]);
    }
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setStoreId(null);
    localStorage.removeItem('cart_items');
    localStorage.removeItem('cart_storeId');
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, storeId, addItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};