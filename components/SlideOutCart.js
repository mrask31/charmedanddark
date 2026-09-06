"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { posthog } from '@/components/providers/posthog-provider';
import { getAttributionProps } from '@/lib/attribution';

const money = (amount, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export default function SlideOutCart() {
  const { items, cart, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, clearCart, refreshCart, checkout, pending, isLoaded, validated, error, issues } = useCart();
  const dialogRef = useRef(null);
  const prevIsOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      posthog?.capture?.('cart_opened', {
        item_count: items.reduce((sum, item) => sum + item.quantity, 0), cart_total: subtotal,
        url: window.location.href, ...getAttributionProps(),
      });
      refreshCart();
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, items, subtotal, refreshCart]);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('button')?.focus();
    function handleKeyDown(event) {
      if (event.key === 'Escape') { setIsOpen(false); return; }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialogRef.current?.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]') || []);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      // Mobile navigation remounts after the drawer closes; an add button may still be disabled.
      requestAnimationFrame(() => {
        if (document.querySelector('[role="dialog"][aria-modal="true"]')) return;
        const canReceiveFocus = element => element?.isConnected && element !== document.body && !element.disabled && element.getClientRects().length > 0;
        const cartTrigger = Array.from(document.querySelectorAll('nav button, button[aria-label="Open cart"]')).find(button => canReceiveFocus(button) && (button.getAttribute('aria-label') === 'Open cart' || button.textContent.trim().startsWith('Cart')));
        const target = canReceiveFocus(previousFocus) ? previousFocus : document.querySelector('[data-cart-return-focus]') || cartTrigger;
        target?.focus({ preventScroll: true });
      });
    };
  }, [isOpen, setIsOpen]);

  async function handleCheckout() {
    posthog?.capture?.('checkout_started', {
      item_count: items.reduce((sum, item) => sum + item.quantity, 0), cart_total: cart?.total,
      product_titles: items.map(item => item.name), product_handles: items.map(item => item.slug),
      skus: items.map(item => item.shopifyVariantId), url: window.location.href, ...getAttributionProps(),
    });
    try { await checkout(); } catch { /* CartContext displays the actionable error inline. */ }
  }

  if (!isOpen) return null;
  const pricesReady = validated && !pending;
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" aria-hidden="true" onClick={() => setIsOpen(false)} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="cart-heading" className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#08080f] border-l border-zinc-800 z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 id="cart-heading" className="text-white uppercase tracking-widest text-sm font-light">Your Selection</h2>
          <button onClick={() => setIsOpen(false)} className="min-h-11 px-2 text-zinc-300 hover:text-white focus-visible:outline focus-visible:outline-[#c9a96e]">Close</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6" aria-busy={pending}>
          <p role="status" className="text-sm text-zinc-300">{pending ? 'Updating your selection…' : !isLoaded ? 'Loading your selection…' : ''}</p>
          {error && (
            <div role="alert" className="rounded border border-[#c9a96e]/40 bg-[#c9a96e]/10 p-3 text-sm text-[#e8e4dc]">
              <p>{error}</p>
              <button disabled={pending} onClick={refreshCart} className="mt-2 min-h-11 underline underline-offset-4 text-[#c9a96e] disabled:opacity-50">Retry cart update</button>
            </div>
          )}
          {!items.length ? (pending || !isLoaded ? null : (
            <div className="space-y-4">
              <p className="text-zinc-300 text-sm">Your cart is empty.</p>
              <Link href="/shop" onClick={() => setIsOpen(false)} className="inline-flex min-h-11 items-center text-[#c9a96e] underline underline-offset-4">Explore the shop</Link>
            </div>
          )) : items.map((item, index) => {
            const itemIssues = issues.filter(issue => issue.merchandiseId === item.shopifyVariantId || issue.cartKey === item.cartKey || issue.index === index);
            return (
              <div key={item.cartKey} className="flex gap-4 border-b border-zinc-800 pb-5">
                {item.imageUrl && <Image src={item.imageUrl} alt={item.name || 'Saved product'} width={80} height={100} className="w-20 h-24 object-cover" />}
                <div className="min-w-0 flex-1">
                  <Link href={item.slug ? `/shop/${encodeURIComponent(item.slug)}` : '/shop'} onClick={() => setIsOpen(false)} className="text-white text-sm hover:underline">{item.name || 'Saved product'}</Link>
                  {(item.variant || item.size) && <p className="text-xs text-zinc-300 mt-1">{item.variant || item.size}</p>}
                  <div className="text-sm mt-2">
                    {pricesReady ? <><span className="text-zinc-200">{money(item.price, item.currency)} each</span><p className="text-zinc-300">{money(item.lineTotal, item.currency)} total</p></> : <span className="text-zinc-400">Price confirmed when cart updates</span>}
                    {pricesReady && item.discounts?.map((discount, i) => <p key={i} className="text-xs text-[#c9a96e]">{discount.title}: −{money(discount.amount, discount.currency)}</p>)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button disabled={pending} onClick={() => updateQuantity(item.cartKey, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`} className="h-11 w-11 border border-zinc-700 text-zinc-200 disabled:opacity-40">−</button>
                    <span className="text-white text-sm min-w-5 text-center" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                    <button disabled={pending || item.quantity >= 100} onClick={() => updateQuantity(item.cartKey, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`} className="h-11 w-11 border border-zinc-700 text-zinc-200 disabled:opacity-40">+</button>
                  </div>
                  {item.needsSelection && <Link href={item.slug ? `/shop/${encodeURIComponent(item.slug)}` : '/shop'} onClick={() => setIsOpen(false)} className="inline-block py-3 text-sm text-[#c9a96e] underline">Review this product’s options</Link>}
                  {itemIssues.map((issue, i) => <div key={i} className="mt-2 text-xs text-[#c9a96e]"><p>{issue.message}</p>{Number.isInteger(issue.acceptedQuantity) && issue.acceptedQuantity > 0 && issue.acceptedQuantity !== item.quantity && <button disabled={pending} onClick={() => updateQuantity(item.cartKey, issue.acceptedQuantity)} className="min-h-11 underline underline-offset-4 disabled:opacity-40">Use quantity {issue.acceptedQuantity}</button>}</div>)}
                  <button disabled={pending} onClick={() => removeItem(item.cartKey)} className="min-h-11 text-xs text-zinc-300 underline underline-offset-4 disabled:opacity-40" aria-label={`Remove ${item.name}`}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
        {!!items.length && (
          <div className="border-t border-zinc-800 p-6 space-y-3 bg-[#08080f]">
            {pricesReady && cart ? <>
              <div className="flex justify-between text-sm text-zinc-300"><span>Subtotal</span><span>{money(cart.subtotal, cart.currency)}</span></div>
              {cart.discounts.map((discount, i) => <div key={i} className="flex justify-between text-xs text-[#c9a96e]"><span>{discount.title}</span><span>−{money(discount.amount, discount.currency)}</span></div>)}
              <div className="flex justify-between text-base text-white"><span>Estimated total</span><span>{money(cart.total, cart.currency)}</span></div>
              {cart.memberDiscountApplied && <p className="text-xs text-[#c9a96e]">Your Sanctuary discount is applied to eligible items.</p>}
            </> : <p className="text-sm text-zinc-300">We’ll confirm your current total before checkout.</p>}
            <p className="text-zinc-400 text-xs">Shipping, taxes and final discounts are confirmed at checkout.</p>
            <button onClick={handleCheckout} disabled={pending || !isLoaded || !validated || items.some(item => item.needsSelection || item.available === false)} className="w-full min-h-12 bg-black text-white border border-zinc-600 hover:border-[#B89C6D] py-3 uppercase tracking-widest text-sm disabled:opacity-50 focus-visible:outline focus-visible:outline-[#c9a96e]">{pending ? 'Updating Cart…' : 'Proceed to Checkout'}</button>
            <button disabled={pending} onClick={clearCart} className="w-full min-h-11 text-zinc-400 hover:text-zinc-200 text-xs uppercase tracking-wider disabled:opacity-40">Clear Selection</button>
          </div>
        )}
      </div>
    </>
  );
}
