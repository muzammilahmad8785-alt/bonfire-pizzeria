import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductAddon } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product, 
    size?: 'Small' | 'Medium' | 'Large' | 'Single', 
    addons?: ProductAddon[], 
    quantity?: number,
    notes?: string
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bonfire_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to local storage', e);
    }
  }, [items]);

  const addItem = (
    product: Product, 
    size?: 'Small' | 'Medium' | 'Large' | 'Single', 
    addons: ProductAddon[] = [], 
    quantity: number = 1,
    notes?: string
  ) => {
    // Determine base price according to size
    let basePrice = 0;
    const chosenSize = size || product.availableSizes[0] || 'Single';

    if (chosenSize === 'Small') {
      basePrice = product.smallPrice || product.singlePrice || 0;
    } else if (chosenSize === 'Medium') {
      basePrice = product.mediumPrice || product.singlePrice || 0;
    } else if (chosenSize === 'Large') {
      basePrice = product.largePrice || product.singlePrice || 0;
    } else {
      basePrice = product.singlePrice || product.smallPrice || 0;
    }

    const addonsTotal = addons.reduce((sum, a) => sum + (a.price || 0), 0);
    const unitPrice = basePrice + addonsTotal;

    // Create unique ID for item options signature
    const addonsKey = addons.map(a => a.id).sort().join(',');
    const itemSignature = `${product.id}-${chosenSize}-${addonsKey}`;

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === itemSignature);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: itemSignature,
            productId: product.id,
            name: product.name,
            image: product.image,
            selectedSize: chosenSize,
            selectedAddons: addons,
            itemPrice: unitPrice,
            quantity,
            notes
          }
        ];
      }
    });

    // Auto open drawer to feedback to customer
    setIsCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
