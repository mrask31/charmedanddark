'use client';

import { useState, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

/**
 * AddToCart — handles Shopify variant selection, quantity, and cart logic.
 *
 * Props:
 *   shopifyVariants  { options: [{name, values}], variants: [{shopifyVariantId, title, price, selectedOptions, imageUrl, ...}] }
 *   product          product row (slug, name, price, imageUrls, ...)
 *   onVariantChange  optional callback(variant|null) — lets parent track selected variant for price display
 */
export default function AddToCart({ shopifyVariants, product, onVariantChange }) {
  const { addItem } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [cartState, setCartState] = useState('idle'); // idle | loading | success | error
  const isAddingRef = useRef(false); // sync guard against rapid double-taps

  const { options, variants } = shopifyVariants;

  const allOptionsSelected = options.every((opt) => selectedOptions[opt.name]);

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
    if (isAddingRef.current || cartState !== 'idle' || !selectedVariant) return;
    isAddingRef.current = true;
    setCartState('loading');
    try {
      console.log('All variants:', variants.map(v => ({ id: v.shopifyVariantId, title: v.title, options: v.selectedOptions })));
      console.log('User selected:', selectedOptions);
      console.log('Matched variant:', selectedVariant?.shopifyVariantId, selectedVariant?.title);
      addItem(
        {
          ...product,
          price: selectedVariant.price,
          shopifyVariantId: selectedVariant.shopifyVariantId,
        },
        quantity
      );
      setCartState('success');
      setTimeout(() => setCartState('idle'), 2000);
    } catch (err) {
      console.error('Add to cart failed:', err);
      setCartState('error');
    } finally {
      isAddingRef.current = false;
    }
  }

  const needsSelection = !allOptionsSelected;
  const buttonDisabled = cartState !== 'idle' || needsSelection;
  const missingOptions = options.filter((opt) => !selectedOptions[opt.name]);
  const buttonLabel =
    cartState === 'loading' ? 'Adding...'
    : cartState === 'success' ? 'Added to Cart ✓'
    : cartState === 'error' ? 'Something went wrong'
    : needsSelection ? `Select ${missingOptions.map((o) => o.name.toLowerCase()).join(' and ')}`
    : 'Add to Cart';

  return (
    <div className="flex flex-col gap-6">
      {/* Option selectors (Size, Color, etc.) */}
      {options.map((option) => (
        <div key={option.name} className="flex flex-col gap-3">
          <label
            className="text-[11px] uppercase tracking-[0.2em]"
            style={{ color: '#c9a96e', fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
          >
            {option.name}
          </label>
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
      ))}

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
            ? 'border-[rgba(201,169,110,0.25)] text-[#6b6760] cursor-not-allowed'
            : 'border-[#c9a96e] bg-transparent text-[#c9a96e] hover:bg-[rgba(201,169,110,0.15)]'
        } disabled:opacity-50`}
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
