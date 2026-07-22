"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

export function StickyNav() {
  const { itemCount, setIsOpen } = useCart();
  const { user, isMember, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const navLinkClass = "text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white";

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-6 lg:px-16">
        <Link
          href="/"
          className="font-serif text-xl uppercase tracking-[0.3em] text-white transition-opacity hover:opacity-80"
        >
          Charmed <span style={{ color: '#c9a96e' }}>&amp;</span> Dark
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <div className="group relative">
            <Link href="/shop" className={navLinkClass}>Shop</Link>
            <div className="invisible absolute left-0 top-full z-[70] mt-3 w-60 translate-y-1 border border-[rgba(201,169,110,0.18)] bg-[#0e0e1a] py-2 opacity-0 shadow-2xl transition-all duration-160 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <Link href="/shop" className="block px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:bg-white/5 hover:text-white">Shop All</Link>
              <Link href="/collections/kiss-lock-bags" className="block px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:bg-white/5 hover:text-white">Kiss Lock Bags</Link>
              <Link href="/collections/smutty-good-girl" className="block px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-[#d7a0b5] transition-colors hover:bg-white/5 hover:text-white">S.G.G. Collection <span className="ml-2 text-[8px] tracking-[0.12em] text-[#8d747e]">NEW</span></Link>
              <Link href="/drops" className="block px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:bg-white/5 hover:text-white">New Drops</Link>
            </div>
          </div>
          <Link href="/drops" className={navLinkClass}>Drops</Link>
          <Link href="/journal" className={navLinkClass}>Journal</Link>
          <Link href="/contact" className={navLinkClass}>Contact</Link>
          <Link href="/about" className={navLinkClass}>About</Link>
          <Link href="/join" className={navLinkClass}>Join</Link>
          <button onClick={() => setIsOpen(true)} className="relative text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white">
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center bg-[#B89C6D] text-xs font-medium text-black">{itemCount}</span>
            )}
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="relative text-zinc-400 transition-colors duration-160 hover:text-white" aria-label="Account">
                <User size={18} />
                {isMember && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#c9a96e]" />}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 py-2" style={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(201,169,110,0.2)', zIndex: 60 }}>
                  {isMember && <p className="px-4 py-2 text-xs" style={{ color: '#c9a96e' }}>Sanctuary Member</p>}
                  <button onClick={() => { signOut(); setDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors">Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setAuthModalOpen(true)} className="text-zinc-400 transition-colors duration-160 hover:text-white" aria-label="Sign in"><User size={18} /></button>
          )}
        </nav>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="signin" />
    </header>
  );
}
