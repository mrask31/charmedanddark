"use client";

import { useCart } from '@/context/CartContext';

export default function AddToCartButton({ product }) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem(product)}
      className="w-full bg-black text-white border border-zinc-700 hover:border-[#B89C6D] py-4 uppercase tracking-widest text-sm transition-colors duration-160"
      style={{ borderRadius: '0px' }}
    >
      Add to Selection
    </button>
  );
}
