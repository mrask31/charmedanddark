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
          <button
            onClick={() => setIsOpen(true)}
            className="relative text-white/70 hover:text-white transition-colors"
          >
            <span className="uppercase tracking-wider text-sm">Cart</span>
            {itemCount > 0 && (
              <span
                className="absolute -top-2 -right-3 bg-[#B89C6D] text-black text-xs w-5 h-5 flex items-center justify-center font-medium"
                style={{ borderRadius: '0px' }}
              >
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
