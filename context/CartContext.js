"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CART_STORAGE_VERSION, isVariantId, readSavedCart, rebaseBasket } from '@/lib/shopify/cart-input';
import { buildCartAttributes } from '@/lib/attribution';

const CartContext = createContext();
const STORAGE_KEY = 'charmed-dark-cart-v2';

export function CartProvider({ children }) {
  const { supabase, user } = useAuth();
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [issues, setIssues] = useState([]);
  const itemsRef = useRef([]);
  const cartIdRef = useRef(null);
  const busyRef = useRef(false);
  const loadedRef = useRef(false);
  const epochRef = useRef(0);
  const authRefreshRef = useRef(false);

  const saveItems = useCallback(next => {
    itemsRef.current = next;
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CART_STORAGE_VERSION, cartId: cartIdRef.current, items: next }));
      // Preserve a compatible snapshot for customers if the previous site deployment is restored.
      localStorage.setItem('charmed-dark-cart', JSON.stringify(next));
    } catch { /* Private browsing may block storage; the in-memory cart remains usable. */ }
  }, []);

  const applyCart = useCallback(next => {
    cartIdRef.current = next?.id || null;
    setCart(next);
    saveItems(next?.items || []);
    setValidated(true);
  }, [saveItems]);

  const requestCart = useCallback(async (nextItems, checkout = false) => {
    if (busyRef.current) throw new Error('Please wait for your cart to finish updating.');
    busyRef.current = true;
    const baseItems = itemsRef.current;
    const epoch = epochRef.current;
    setPending(true);
    setError('');
    setIssues([]);
    setValidated(false);
    async function synchronize() {
      if (epoch !== epochRef.current) return null;
      // The browser lock serializes tabs; the delta preserves items added in another tab.
      let desired = nextItems;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const saved = stored ? readSavedCart(stored) : null;
        if (saved?.items) {
          desired = rebaseBasket(baseItems, nextItems, saved.items);
          cartIdRef.current = saved.cartId;
        }
      } catch { /* Storage may be unavailable. Keep the current tab's selection. */ }
      saveItems(desired);
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
      const response = await fetch(checkout ? '/api/checkout' : '/api/cart', {
        method: 'POST', headers, cache: 'no-store',
        body: JSON.stringify({ cartId: cartIdRef.current, items: desired, ...(checkout ? { attribution: buildCartAttributes() } : {}) }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await response.json();
      if (epoch !== epochRef.current) return null;
      if (!response.ok) {
        // Shopify may have partially updated a cart. Retain every intended line for review/retry.
        if (data.cart?.id) { cartIdRef.current = data.cart.id; saveItems(desired); }
        setIssues(data.issues || []);
        throw new Error(data.error || 'Please review your cart and try again.');
      }
      if ('cart' in data) applyCart(data.cart);
      setIssues(data.issues || []);
      if (data.messages?.length) setError(data.messages.join(' '));
      return data;
    }
    try {
      return await (navigator.locks ? navigator.locks.request(STORAGE_KEY, synchronize) : synchronize());
    } catch (err) {
      if (epoch !== epochRef.current) return null;
      const message = err.name === 'TimeoutError' || err.name === 'AbortError'
        ? 'Your cart is taking longer than expected. Your selection is saved; please try again.'
        : err.message || 'Your selection is saved. Please try updating your cart again.';
      setError(message);
      setValidated(false);
      throw new Error(message);
    } finally {
      busyRef.current = false;
      setPending(false);
      if (authRefreshRef.current) {
        authRefreshRef.current = false;
        // Give the latest authentication state its own server verification after this request settles.
        queueMicrotask(() => requestCart(itemsRef.current).catch(() => {}));
      }
    }
  }, [supabase, applyCart, saveItems]);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    let saved = { items: [], cartId: null };
    try {
      saved = readSavedCart(localStorage.getItem(STORAGE_KEY) || localStorage.getItem('charmed-dark-cart'));
    } catch { /* Corrupt JSON does not block a fresh cart. */ }
    cartIdRef.current = saved.cartId;
    saveItems(saved.items);
    setIsLoaded(true);
    if (saved.items.length || saved.cartId) requestCart(saved.items).catch(() => {});
    else setValidated(true);
  }, [requestCart, saveItems]);

  const lastUserRef = useRef(user?.id);
  useEffect(() => {
    if (lastUserRef.current === user?.id) return;
    lastUserRef.current = user?.id;
    epochRef.current += 1;
    setValidated(false);
    if (!loadedRef.current) return;
    if (busyRef.current) authRefreshRef.current = true;
    else requestCart(itemsRef.current).catch(() => {});
  }, [user?.id, requestCart]);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      if (busyRef.current) return; // The shared lock rebases this request when it acquires ownership.
      try {
        const saved = readSavedCart(event.newValue);
        cartIdRef.current = saved.cartId;
        itemsRef.current = saved.items;
        setItems(saved.items);
        setValidated(false);
        setCart(null);
        setError('Your selection changed in another tab. Update your cart to confirm its current prices.');
      } catch { /* Ignore an incomplete storage event. */ }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    function handleLogout() {
      epochRef.current += 1;
      cartIdRef.current = null;
      setCart(null);
      saveItems([]);
      setIsOpen(false);
      setError('');
      setIssues([]);
      setValidated(true);
    }
    window.addEventListener('sanctuary-logout', handleLogout);
    return () => window.removeEventListener('sanctuary-logout', handleLogout);
  }, [saveItems]);

  const addItem = useCallback(async (product, quantity = 1) => {
    if (!isVariantId(product.shopifyVariantId)) throw new Error('Please open this product and select its options first.');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) throw new Error('Please choose a quantity from 1 to 100.');
    if (!loadedRef.current || busyRef.current) throw new Error('Please wait for your cart to finish updating.');
    const existing = itemsRef.current.find(item => !item.needsSelection && item.shopifyVariantId === product.shopifyVariantId);
    if ((existing?.quantity || 0) + quantity > 100) throw new Error('A maximum of 100 of one option can be added at a time.');
    const next = existing ? itemsRef.current.map(item => item === existing ? { ...item, quantity: item.quantity + quantity } : item) : [...itemsRef.current, {
      cartKey: product.shopifyVariantId, shopifyVariantId: product.shopifyVariantId,
      slug: product.slug, name: product.name, variant: product.variantTitle === 'Default Title' ? null : product.variantTitle,
      quantity, price: Number(product.price), imageUrl: product.imageUrl || product.imageUrls?.[0], currency: product.currency || 'USD',
    }];
    setIsOpen(true);
    return requestCart(next);
  }, [requestCart]);

  const updateQuantity = useCallback(async (cartKey, quantity) => {
    if (busyRef.current) return;
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 100) return;
    const next = quantity === 0 ? itemsRef.current.filter(item => item.cartKey !== cartKey) : itemsRef.current.map(item => item.cartKey === cartKey ? { ...item, quantity } : item);
    try { await requestCart(next); } catch { /* The drawer presents the retained selection and retry action. */ }
  }, [requestCart]);
  const removeItem = useCallback(cartKey => updateQuantity(cartKey, 0), [updateQuantity]);
  const refreshCart = useCallback(async () => {
    if (busyRef.current) return;
    try { await requestCart(itemsRef.current); } catch { /* Visible error remains until retry. */ }
  }, [requestCart]);
  const clearCart = useCallback(async () => {
    if (busyRef.current) return;
    try { await requestCart([]); } catch { /* Keep empty selection for an idempotent retry. */ }
  }, [requestCart]);

  const checkout = useCallback(async () => {
    const previousTotal = cart?.total;
    const data = await requestCart(itemsRef.current, true);
    if (!data) return;
    if (previousTotal != null && Math.abs(previousTotal - data.cart.total) > 0.005) {
      setError('Your cart total has changed. Please review it, then continue to checkout.');
      return;
    }
    if (data.checkoutUrl) window.location.assign(data.checkoutUrl);
  }, [cart?.total, requestCart]);

  const itemCount = items.reduce((sum, item) => sum + (Number.isInteger(item.quantity) ? item.quantity : 0), 0);
  return <CartContext.Provider value={{ items, cart, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, refreshCart, checkout, itemCount, subtotal: cart?.subtotal ?? 0, pending, isLoaded, validated, error, issues }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
