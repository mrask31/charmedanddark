"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { SHOP_COLLECTIONS, THEME_COLLECTIONS } from "@/lib/discovery";
import AuthModal from "@/components/AuthModal";

export function StickyNav() {
  const { itemCount, setIsOpen, isOpen: cartOpen } = useCart();
  const { user, isMember, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutsideClick = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) setMobileMenuOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

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
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:px-10 lg:py-6">
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="whitespace-nowrap font-serif text-base uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80 sm:text-xl"
        >
          Charmed <span style={{ color: '#c9a96e' }}>&amp;</span> Dark
        </Link>
        <button ref={mobileMenuButtonRef} type="button" aria-expanded={mobileMenuOpen && !cartOpen} aria-controls="mobile-shop-menu" onClick={() => setMobileMenuOpen((open) => !open)} className="flex min-h-11 items-center gap-2 px-1 text-sm text-[#e8e4dc] lg:hidden">
          {mobileMenuOpen && !cartOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />} Menu
        </button>
        <nav aria-label="Primary navigation" className="hidden items-center gap-5 lg:flex">
          <div className="group relative">
            <Link href="/shop" className={navLinkClass}>Shop</Link>
            <div className="invisible absolute left-0 top-full z-[70] pt-3 w-60 max-h-[75vh] overflow-y-auto translate-y-1 border border-[rgba(201,169,110,0.18)] bg-[#0e0e1a] pb-2 opacity-0 shadow-2xl transition-all duration-160 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <Link href="/shop" className="block px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:bg-white/5 hover:text-white">Shop All</Link>
              {SHOP_COLLECTIONS.map((collection) => <Link key={collection.handle} href={`/collections/${collection.handle}`} className="block px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-300 hover:bg-white/5 hover:text-white">{collection.label}</Link>)}
              <p className="border-t border-zinc-700 px-4 pt-3 text-[10px] uppercase tracking-widest text-[#c9a96e]">Collections</p>
              {THEME_COLLECTIONS.map((collection) => <Link key={collection.handle} href={`/collections/${collection.handle}`} className="block px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-zinc-300 hover:bg-white/5 hover:text-white">{collection.label}</Link>)}
            </div>
          </div>
          <Link href="/drops" className={navLinkClass}>Drops</Link>
          <Link href="/last-chance" className={navLinkClass}>Last Chance</Link>
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

      {mobileMenuOpen && !cartOpen && (
        <nav id="mobile-shop-menu" aria-label="Shop and explore" className="absolute left-0 right-0 top-full max-h-[calc(100dvh-9rem-env(safe-area-inset-bottom,0px))] overflow-y-auto overscroll-contain border-b border-[#c9a96e]/30 bg-[#101014] px-5 py-4 shadow-2xl sm:px-8 lg:hidden">
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center justify-between border-b border-white/10 text-base text-[#e5c997]">Shop everything <span aria-hidden="true">→</span></Link>
          <div className="grid grid-cols-2 gap-x-4 py-3">
            {SHOP_COLLECTIONS.map((collection) => <Link key={collection.handle} href={`/collections/${collection.handle}`} onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center py-2 text-sm text-[#e8e4dc]">{collection.label}</Link>)}
          </div>
          <div className="grid grid-cols-2 gap-x-4 border-t border-white/10 pt-3">
            {[{ href: '/drops', label: 'New & upcoming drops' }, { href: '/last-chance', label: 'Last Chance' }, ...THEME_COLLECTIONS.map((collection) => ({ href: `/collections/${collection.handle}`, label: collection.label })), { href: '/about', label: 'Our story' }, { href: '/join', label: 'The Sanctuary' }, { href: '/mirror', label: 'The Mirror' }, { href: '/journal', label: 'Journal' }, { href: '/contact', label: 'Contact us' }].map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="flex min-h-12 items-center py-2 text-sm text-[#c4bdb3]">{link.label}</Link>)}
          </div>
        </nav>
      )}

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="signin" />
    </header>
  );
}
