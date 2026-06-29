'use client';

import { useState, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { posthog } from '@/components/providers/posthog-provider';
import { getAttributionProps } from '@/lib/attribution';
import { getAvailableInventory, calculateAddableQuantity } from '@/lib/inventory';

/**
 * AddToCart — handles Shopify variant selection, quantity, and cart logic.
 *
 * Props:
 *   shopifyVariants  { options: [{name, values}], variants: [{shopifyVariantId, title, price, selectedOptions, imageUrl, ...}] }
 *   product          product row (slug, name, price, imageUrls, ...)
 *   onVariantChange  optional callback(variant|null) — lets parent track selected variant for price display
 */
export default function AddToCart({ shopifyVariants, product, onVariantChange, onColorSelect }) {
  const { addItem, items } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [cartState, setCartState] = useState('idle'); // idle | loading | success | error
  const [selectionError, setSelectionError] = useState('');
  const [inventoryNotice, setInventoryNotice] = useState(null);
  const isAddingRef = useRef(false); // sync guard against rapid double-taps

  const { options, variants } = shopifyVariants;

  const allOptionsSelected = options.every((opt) => selectedOptions[opt.name]);
  const missingOptions = options.filter((opt) => !selectedOptions[opt.name]);
  const missingOptionNames = missingOptions.map((opt) => opt.name.toLowerCase());
  const selectedOptionSummary = options
    .filter((opt) => selectedOptions[opt.name])
    .map((opt) => `${opt.name}: ${selectedOptions[opt.name]}`)
    .join(' · ');

  // Only attempt a match once every option has a value — prevents variants with
  // empty selectedOptions (e.g. "Default Title") from matching prematurely via
  // [].every() → true.
  const selectedVariant = allOptionsSelected
    ? variants.find((v) =>
        v.selectedOptions.every((opt) => selectedOptions[opt.name] === opt.value)
      ) ?? null
    : null;

  function handleOptionChange(optionName, value) {
    const next = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(next);
    setSelectionError('');

    // Notify parent of color-variant image URL (fires even before all options selected)
    if (onColorSelect && optionName === 'Color') {
      const colorVariant = variants.find((v) =>
        v.selectedOptions.some((opt) => opt.name === 'Color' && opt.value === value)
      );
      onColorSelect(colorVariant?.imageUrl || null);
    }

    // Notify parent of the newly matched variant (or null)
    if (onVariantChange) {
      const allSelected = options.every((opt) => next[opt.name]);
      const match = allSelected
        ? variants.find((v) =>
            v.selectedOptions.every((opt) => next[opt.name] === opt.value)
          ) ?? null
        : null;
      onVariantChange(match);
    }
  }

  async function handleAddToCart() {
    if (isAddingRef.current || cartState === 'loading' || cartState === 'success') return;

    if (!selectedVariant) {
      const missing = missingOptions.map((o) => o.name.toLowerCase());
      const msg = missing.length > 0
        ? `Please select ${missing.join(' and ')} before adding to cart.`
        : 'Please choose an available option combination.';
      setSelectionError(msg);
      posthog?.capture?.('add_to_cart_missing_variant', {
        product: product.name,
        product_title: product.name,
        product_handle: product.slug,
        product_type: product.category || undefined,
        missing,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        ...getAttributionProps(),
      });
      return;
    }

    isAddingRef.current = true;
    setCartState('loading');
    setSelectionError('');
    setInventoryNotice(null);

    // Inventory check using Shopify variant quantityAvailable
    const available = getAvailableInventory({
      productQty: product.qty,
      variantQuantityAvailable: selectedVariant.quantityAvailable,
    });
    const cartKey = `${product.slug}__sv_${selectedVariant.shopifyVariantId}`;
    const alreadyInCart = items.find((i) => i.cartKey === cartKey)?.quantity || 0;
    const { canAdd, limited, reason } = calculateAddableQuantity({
      requested: quantity,
      alreadyInCart,
      available,
    });

    if (limited) {
      if (reason === 'sold_out') {
        setInventoryNotice('This item is currently sold out.');
        setCartState('idle');
        isAddingRef.current = false;
        posthog?.capture?.('inventory_quantity_limited', {
          product_title: product.name, product_handle: product.slug,
          variant_title: selectedVariant.title || undefined,
          variant_id: selectedVariant.shopifyVariantId || undefined,
          requested_quantity: quantity, available_quantity: available,
          cart_quantity_before: alreadyInCart, quantity_added: 0,
          location: 'product_page', url: window.location.href,
        });
        return;
      }
      if (reason === 'at_limit') {
        setInventoryNotice(`Only ${available} available. You already have the maximum quantity in your cart.`);
        setCartState('idle');
        isAddingRef.current = false;
        posthog?.capture?.('inventory_quantity_limited', {
          product_title: product.name, product_handle: product.slug,
          variant_title: selectedVariant.title || undefined,
          variant_id: selectedVariant.shopifyVariantId || undefined,
          requested_quantity: quantity, available_quantity: available,
          cart_quantity_before: alreadyInCart, quantity_added: 0,
          location: 'product_page', url: window.location.href,
        });
        return;
      }
      if (reason === 'partial') {
        setInventoryNotice(`Only ${available} available. We added ${canAdd} to your cart.`);
        posthog?.capture?.('inventory_quantity_limited', {
          product_title: product.name, product_handle: product.slug,
          variant_title: selectedVariant.title || undefined,
          variant_id: selectedVariant.shopifyVariantId || undefined,
          requested_quantity: quantity, available_quantity: available,
          cart_quantity_before: alreadyInCart, quantity_added: canAdd,
          location: 'product_page', url: window.location.href,
        });
      }
    }

    const addQty = limited ? canAdd : quantity;

    try {
      addItem(
        {
          ...product,
          // Use Supabase variant price_override if available, otherwise base price
          price: (() => {
            if (product.productVariants?.length > 0 && selectedVariant) {
              const match = product.productVariants.find((pv) =>
                selectedVariant.selectedOptions?.some(
                  (opt) => pv.variant_type === opt.name.toLowerCase() && pv.variant_value === opt.value
                )
              );
              if (match?.price_override != null) return parseFloat(match.price_override);
            }
            return product.price;
          })(),
          shopifyVariantId: selectedVariant.shopifyVariantId,
          imageUrl: selectedVariant.imageUrl || product.imageUrls?.[0] || null,
          availableQty: available,
        },
        addQty
      );
      setCartState('success');
      posthog?.capture?.('add_to_cart', {
        product_title: product.name,
        product_handle: product.slug,
        product_type: product.category || undefined,
        variant_title: selectedVariant.title || undefined,
        variant_id: selectedVariant.shopifyVariantId || undefined,
        sku: selectedVariant.sku || product.sku || undefined,
        price: product.price,
        currency: 'USD',
        quantity: addQty,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        ...getAttributionProps(),
      });
      setTimeout(() => setCartState('idle'), 2000);
    } catch (err) {
      console.error('Add to cart failed:', err);
      setCartState('error');
    } finally {
      isAddingRef.current = false;
    }
  }

  const needsSelection = !allOptionsSelected;
  const buttonDisabled = cartState === 'loading' || cartState === 'success';
  const buttonLabel =
    cartState === 'loading' ? 'Adding...'
    : cartState === 'success' ? 'Added to Cart ✓'
    : cartState === 'error' ? 'Something went wrong'
    : needsSelection && missingOptions.length === 1 ? `Select ${missingOptions[0].name}`
    : needsSelection && missingOptions.length > 1 ? `Select ${missingOptionNames.join(' + ')}`
    : 'Add to Cart';

  return (
    <div className="flex flex-col gap-6">
      {/* Option selectors (Size, Color, etc.) */}
      {options.map((option) => {
        const isMissing = !selectedOptions[option.name];

        return (
          <div key={option.name} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <label
                className="text-[11px] uppercase tracking-[0.2em]"
                style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                {option.name}
              </label>
              {isMissing && (
                <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
                  Required
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label={`Select ${option.name}`}>
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleOptionChange(option.name, value)}
                    aria-pressed={isSelected}
                    className={`rounded-full px-4 py-2 text-[13px] font-light tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a96e] ${
                      isSelected
                        ? 'border border-[#c9a96e] text-[#c9a96e]'
                        : 'border border-[rgba(201,169,110,0.25)] text-[#6b6760] hover:border-[rgba(201,169,110,0.5)] hover:text-[#e8e4dc]'
                    }`}
                    style={{ backgroundColor: '#0e0e1a', fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-[12px] font-light leading-relaxed" style={{ color: '#6b6760', fontFamily: 'Inter, sans-serif' }}>
        {selectedOptionSummary || `Choose ${missingOptionNames.join(' and ')} before adding this item to your cart.`}
      </p>

      {/* Quantity */}
      <div className="flex flex-col gap-3">
        <label
          className="text-[11px] uppercase tracking-[0.2em]"
          style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
        >
          Qty
        </label>
        <div className="flex items-center" role="group" aria-label="Select quantity">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline-none"
            style={{ color: '#c9a96e', border: '1px solid rgba(201,169,110,0.2)', backgroundColor: '#0e0e1a' }}
          >
            <Minus size={14} />
          </button>
          <div
            className="flex h-10 w-12 items-center justify-center text-sm font-light"
            style={{
              color: '#e8e4dc',
              borderTop: '1px solid rgba(201,169,110,0.2)',
              borderBottom: '1px solid rgba(201,169,110,0.2)',
              backgroundColor: '#0e0e1a',
              fontFamily: 'Inter, sans-serif',
            }}
            aria-live="polite"
          >
            {quantity}
          </div>
          <button
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-70 focus-visible:outline-none"
            style={{ color: '#c9a96e', border: '1px solid rgba(201,169,110,0.2)', backgroundColor: '#0e0e1a' }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={buttonDisabled}
        className={`h-[52px] w-full rounded-full border text-sm uppercase tracking-[0.15em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c9a96e] ${
          cartState === 'loading' ? 'animate-pulse' : ''
        } ${
          cartState === 'success'
            ? 'border-[#c9a96e] bg-[rgba(201,169,110,0.12)] text-[#c9a96e]'
            : cartState === 'error'
            ? 'border-red-500/50 text-red-400'
            : needsSelection
            ? 'border-[rgba(201,169,110,0.45)] bg-[rgba(201,169,110,0.06)] text-[#c9a96e] hover:bg-[rgba(201,169,110,0.12)]'
            : 'border-[#c9a96e] bg-transparent text-[#c9a96e] hover:bg-[rgba(201,169,110,0.15)]'
        } disabled:opacity-50`}
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
      >
        {buttonLabel}
      </button>
      {selectionError && (
        <p role="alert" style={{ color: '#e24b4a', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
          {selectionError}
        </p>
      )}
      {inventoryNotice && (
        <p role="status" style={{ color: '#c9a96e', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
          {inventoryNotice}
        </p>
      )}
    </div>
  );
}