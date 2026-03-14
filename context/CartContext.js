"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('charmed-dark-cart');
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('charmed-dark-cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    const size = product.selectedSize || null;
    const cartKey = size ? `${product.slug}__${size}` : product.slug;

    setItems(prev => {
      const existing = prev.find(item => item.cartKey === cartKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        cartKey,
        slug: product.slug,
        name: product.name,
        size,
        price: product.salePrice || product.price,
        originalPrice: product.price,
        imageUrl: product.imageUrls?.[0] || null,
        quantity,
        shopifyVariantId: product.shopifyVariantId || null,
      }];
    });
    setIsOpen(true); // Auto-open cart when item added
  }, []);

  const removeItem = useCallback((cartKey) => {
    setItems(prev => prev.filter(item => item.cartKey !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey, quantity) => {
    if (quantity <= 0) {
      removeItem(cartKey);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Sanctuary price (10% off)
  const sanctuarySubtotal = subtotal * 0.9;

  return (
    <CartContext.Provider value={{
      items,
      isOpen,
      setIsOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      sanctuarySubtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
