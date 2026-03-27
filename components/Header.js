"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/drops", label: "Drops" },
  { href: "/about", label: "About" },
  { href: "/join", label: "Join" },
];

export default function Header() {
  const { itemCount, setIsOpen } = useCart();

  return (
    <header className="w-full border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">
            Threshold
          </p>
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Charmed <span style={{ color: '#c9a96e' }}>&amp;</span> Dark
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setIsOpen(true)}
            className="relative text-white/70 hover:text-white transition-colors"
            aria-label="Open cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#c9a96e] text-black text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium px-0.5">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
