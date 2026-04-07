"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function SlideOutCart() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, sanctuarySubtotal, clearCart } = useCart();
  const { isMember } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function handleCheckout() {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Shopify checkout — HOUSE10 already applied
        window.location.href = data.checkoutUrl;
      } else {
        console.error('Checkout failed:', data.error);
        alert('Checkout temporarily unavailable. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout temporarily unavailable. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  }

  const FREE_SHIPPING_THRESHOLD = 100;
  const MID_TIER_THRESHOLD = 50;

  function getShippingBanner(subtotal) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return { message: "🖤 You've unlocked free shipping!", type: 'success' };
    }
    if (subtotal >= MID_TIER_THRESHOLD) {
      const remaining = (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);
      return { message: `You're $${remaining} away from FREE shipping!`, type: 'progress' };
    }
    const remaining = (MID_TIER_THRESHOLD - subtotal).toFixed(2);
    return { message: `You're $${remaining} away from discounted shipping ($4.99)!`, type: 'progress' };
  }

  const shippingBanner = getShippingBanner(subtotal);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#08080f] border-l border-zinc-800 z-50 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-white uppercase tracking-widest text-sm font-light">Your Selection</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white transition-colors duration-160"
          >
            Close
          </button>
        </div>

        {/* Shipping Progress Banner */}
        {items.length > 0 && (
          <div className={`mx-4 mt-3 mb-1 rounded-md px-3 py-2 text-center text-sm transition-all duration-300 ${
            shippingBanner.type === 'success'
              ? 'bg-[#c9a96e]/20 text-[#c9a96e] border border-[#c9a96e]/40'
              : 'bg-[#1a1a2e] text-[#e8e4dc]/80 border border-white/10'
          }`}>
            {shippingBanner.type === 'progress' && (
              <div className="w-full bg-white/10 rounded-full h-1 mb-2">
                <div
                  className="bg-[#c9a96e] h-1 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                />
              </div>
            )}
            <span>{shippingBanner.message}</span>
          </div>
        )}

        {/* Member discount badge */}
        {items.length > 0 && isMember && (
          <div className="mx-4 mt-1 mb-2 text-center text-xs text-[#c9a96e]">
            🖤 Sanctuary member discount applied
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <p className="text-zinc-500 text-sm">The cart is empty.</p>
          ) : (
            items.map(item => (
              <div key={item.cartKey || item.slug} className="flex gap-4 border-b border-zinc-900 pb-6">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 object-cover"
                    style={{ borderRadius: '0px' }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-white text-sm">
                    {item.name}
                    {item.variant && <span className="text-zinc-500 ml-2">({item.variant})</span>}
                    {!item.variant && item.size && <span className="text-zinc-500 ml-2">({item.size})</span>}
                  </h3>
                  <p className="text-zinc-400 text-sm mt-1">${item.price.toFixed(2)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.cartKey || item.slug, item.quantity - 1)}
                      className="text-zinc-500 hover:text-white w-6 h-6 flex items-center justify-center border border-zinc-800"
                    >
                      -
                    </button>
                    <span className="text-white text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartKey || item.slug, item.quantity + 1)}
                      className="text-zinc-500 hover:text-white w-6 h-6 flex items-center justify-center border border-zinc-800"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.cartKey || item.slug)}
                  className="text-zinc-600 hover:text-red-400 text-xs uppercase tracking-wider"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer with pricing and checkout */}
        {items.length > 0 && (
          <div className="border-t border-zinc-800 p-6 space-y-4 bg-[#08080f]">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400 uppercase tracking-wider">Public Price</span>
              <span className="text-zinc-400 line-through">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#B89C6D] uppercase tracking-wider">House Price</span>
              <span className="text-[#B89C6D] font-medium">${sanctuarySubtotal.toFixed(2)}</span>
            </div>
            <p className="text-zinc-600 text-xs">Final price calculated by Shopify at checkout.</p>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full bg-black text-white border border-zinc-700 hover:border-[#B89C6D] py-4 uppercase tracking-widest text-sm transition-colors duration-160 disabled:opacity-50"
              style={{ borderRadius: '0px' }}
            >
              {isCheckingOut ? 'Opening Checkout...' : 'Proceed to Checkout'}
            </button>

            <button
              onClick={clearCart}
              className="w-full text-zinc-600 hover:text-zinc-400 text-xs uppercase tracking-wider py-2 transition-colors duration-160"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>
    </>
  );
}
