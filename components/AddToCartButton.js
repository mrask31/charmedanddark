"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function AddToCartButton({ product }) {
  const { addItem, pending, isLoaded } = useCart();
  const [error, setError] = useState('');
  // Multi-option products must be selected on their product page.
  if (!product.shopifyVariantId || product.hasVariants) {
    return <Link href={`/shop/${product.slug}`} className="block py-4 text-center text-[#c9a96e] border border-zinc-700">Choose Options</Link>;
  }
  return <>
    <button disabled={pending || !isLoaded} onClick={async () => { setError(''); try { await addItem(product); } catch (err) { setError(err.message); } }} className="w-full bg-black text-white border border-zinc-700 hover:border-[#B89C6D] py-4 uppercase tracking-widest text-sm disabled:opacity-50">{pending ? 'Adding…' : 'Add to Selection'}</button>
    {error && <p role="alert" className="mt-2 text-sm text-[#e8b1ad]">{error}</p>}
  </>;
}
