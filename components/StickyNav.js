"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function StickyNav() {
  const { itemCount, setIsOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-6 lg:px-16">
        <Link
          href="/"
          className="font-serif text-xl uppercase tracking-[0.3em] text-white transition-opacity hover:opacity-80"
        >
          Charmed & Dark
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
          >
            Shop
          </Link>
          <Link
            href="/drops"
            className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
          >
            Drops
          </Link>
          <Link
            href="/journal"
            className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
          >
            Journal
          </Link>
          <Link
            href="/about"
            className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
          >
            About
          </Link>
          <Link
            href="/join"
            className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
          >
            Join
          </Link>
          <button
            onClick={() => setIsOpen(true)}
            className="relative text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
          >
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center bg-[#B89C6D] text-xs font-medium text-black">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
