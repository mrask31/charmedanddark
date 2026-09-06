'use client';

import { useState, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { posthog } from '@/components/providers/posthog-provider';
import { getAttributionProps } from '@/lib/attribution';

export default function AddToCart({ shopifyVariants, product, onVariantChange, onColorSelect, initialVariant }) {
  const { addItem, pending, isLoaded } = useCart();
  const { options, variants } = shopifyVariants;
  const [selectedOptions, setSelectedOptions] = useState(() => Object.fromEntries(initialVariant
    ? initialVariant.selectedOptions.map(option => [option.name, option.value])
    : options.filter(option => option.values.length === 1).map(option => [option.name, option.values[0]])));
  const [quantity, setQuantity] = useState(1);
  const [cartState, setCartState] = useState('idle');
  const [selectionError, setSelectionError] = useState('');
  const isAddingRef = useRef(false);
  const visibleOptions = options.filter(option => !(option.name === 'Title' && option.values.length === 1 && option.values[0] === 'Default Title'));
  const missingOptions = options.filter(option => !selectedOptions[option.name]);
  const selectedVariant = missingOptions.length ? null : variants.find(variant => variant.selectedOptions.every(option => selectedOptions[option.name] === option.value));
  const soldOut = selectedVariant?.available === false || selectedVariant?.availableForSale === false;

  function isOptionValueAvailable(index, value) {
    return variants.some(variant => variant.available !== false && variant.availableForSale !== false && variant.selectedOptions.every(option => {
      if (option.name === options[index].name) return option.value === value;
      const optionIndex = options.findIndex(candidate => candidate.name === option.name);
      return optionIndex >= index || !selectedOptions[option.name] || selectedOptions[option.name] === option.value;
    }));
  }

  function handleOptionChange(optionName, value) {
    const next = { ...selectedOptions, [optionName]: value };
    const optionIndex = options.findIndex(option => option.name === optionName);
    // A new earlier choice can invalidate later choices. Ask for those again, never guess a replacement variant.
    for (let i = optionIndex + 1; i < options.length; i++) {
      const compatible = variants.some(variant => variant.available !== false && variant.availableForSale !== false && variant.selectedOptions.every(option => {
        const index = options.findIndex(candidate => candidate.name === option.name);
        return index > i || !next[option.name] || next[option.name] === option.value;
      }));
      if (!compatible) delete next[options[i].name];
    }
    setSelectedOptions(next);
    setSelectionError('');
    const match = options.every(option => next[option.name])
      ? variants.find(variant => variant.selectedOptions.every(option => next[option.name] === option.value)) || null : null;
    onVariantChange?.(match);
    if (optionName.toLowerCase() === 'color') {
      onColorSelect?.(variants.find(variant => variant.selectedOptions.some(option => option.name === optionName && option.value === value))?.imageUrl || null);
    }
  }

  async function handleAddToCart() {
    if (isAddingRef.current || pending || cartState === 'success') return;
    if (!selectedVariant || soldOut) {
      const missing = missingOptions.map(option => option.name.toLowerCase());
      setSelectionError(soldOut ? 'This option is sold out. Please choose another option.' : missing.length ? `Please select ${missing.join(' and ')}.` : 'Please choose an available option combination.');
      posthog?.capture?.('add_to_cart_missing_variant', { product: product.name, product_title: product.name, product_handle: product.slug, missing, ...getAttributionProps() });
      return;
    }
    isAddingRef.current = true;
    setCartState('loading');
    setSelectionError('');
    try {
      await addItem({
        ...product,
        price: selectedVariant.price,
        currency: selectedVariant.currency || product.currency || 'USD',
        shopifyVariantId: selectedVariant.shopifyVariantId,
        variantTitle: selectedVariant.title,
        imageUrl: selectedVariant.imageUrl || product.imageUrls?.[0],
      }, quantity);
      setCartState('success');
      posthog?.capture?.('add_to_cart', {
        product_title: product.name, product_handle: product.slug, product_type: product.category,
        variant_title: selectedVariant.title, variant_id: selectedVariant.shopifyVariantId,
        sku: selectedVariant.sku || product.sku, price: selectedVariant.price,
        currency: selectedVariant.currency || 'USD', quantity, url: window.location.href, ...getAttributionProps(),
      });
      setTimeout(() => setCartState('idle'), 2000);
    } catch (error) {
      setCartState('error');
      setSelectionError(error.message || 'We could not add this item. Please try again.');
    } finally { isAddingRef.current = false; }
  }

  const buttonLabel = cartState === 'loading' ? 'Adding…' : cartState === 'success' ? 'Added to Cart ✓' : soldOut ? 'Sold Out' : missingOptions.length ? `Select ${missingOptions.map(option => option.name).join(' + ')}` : 'Add to Cart';
  return (
    <div className="flex flex-col gap-6">
      {visibleOptions.map(option => (
        <fieldset key={option.name} className="flex flex-col gap-3">
          <legend className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#c9a96e]">{option.name}{!selectedOptions[option.name] ? ' · Required' : ''}</legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map(value => {
              const available = isOptionValueAvailable(options.indexOf(option), value);
              const selected = selectedOptions[option.name] === value;
              return <button key={value} type="button" onClick={() => handleOptionChange(option.name, value)} disabled={!available || pending} aria-pressed={selected} aria-label={available ? value : `${value}, sold out`} className={`min-h-11 rounded-full px-4 py-2 text-[13px] tracking-wider border focus-visible:outline focus-visible:outline-[#c9a96e] ${selected ? 'border-[#c9a96e] text-[#c9a96e]' : 'border-[#c9a96e]/30 text-zinc-300'} disabled:opacity-45 disabled:cursor-not-allowed`}>
                {value}{!available && <span className="ml-2 text-[10px]">Sold Out</span>}
              </button>;
            })}
          </div>
        </fieldset>
      ))}
      {!!visibleOptions.length && <p className="text-xs text-zinc-300" aria-live="polite">{visibleOptions.filter(option => selectedOptions[option.name]).map(option => `${option.name}: ${selectedOptions[option.name]}`).join(' · ') || 'Choose your options above.'}</p>}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#c9a96e]">Quantity</span>
        <div className="flex items-center" role="group" aria-label="Select quantity">
          <button type="button" disabled={pending || quantity <= 1} onClick={() => setQuantity(q => q - 1)} aria-label="Decrease quantity" className="h-11 w-11 flex items-center justify-center border border-[#c9a96e]/30 text-[#c9a96e] disabled:opacity-40"><Minus size={14} /></button>
          <span className="h-11 w-12 flex items-center justify-center border-y border-[#c9a96e]/30 text-[#e8e4dc] text-sm" aria-live="polite">{quantity}</span>
          <button type="button" disabled={pending || quantity >= 100} onClick={() => setQuantity(q => q + 1)} aria-label="Increase quantity" className="h-11 w-11 flex items-center justify-center border border-[#c9a96e]/30 text-[#c9a96e] disabled:opacity-40"><Plus size={14} /></button>
        </div>
      </div>
      <button type="button" data-product-add-button onClick={handleAddToCart} disabled={!isLoaded || pending || cartState === 'success' || soldOut} className="h-[52px] w-full rounded-full border border-[#c9a96e] text-[#c9a96e] text-sm uppercase tracking-[0.15em] hover:bg-[#c9a96e]/10 disabled:opacity-50 focus-visible:outline focus-visible:outline-[#c9a96e]">{!isLoaded ? 'Loading Cart…' : buttonLabel}</button>
      {selectionError && <p role="alert" className="text-sm text-[#e8b1ad]">{selectionError}</p>}
    </div>
  );
}
