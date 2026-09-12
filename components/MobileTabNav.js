"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Store, Sparkles, ShoppingBag, UserRound } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

const tabs = [
  { href: "/", label: "Home", icon: House },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/drops", label: "Drops", icon: Sparkles },
];

export default function MobileTabNav() {
  const { isOpen, setIsOpen, itemCount } = useCart();
  const { user, isMember, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();
  const tabClass = "relative flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-xs transition-colors hover:text-white";

  if (isOpen) return null;

  function handleAccountClick() {
    if (user) {
      setAccountOpen((open) => !open);
    } else {
      setAuthModalOpen(true);
    }
  }

  return (
    <>
      {accountOpen && user && (
        <div id="mobile-account-menu" className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] right-3 z-50 w-52 border border-[rgba(201,169,110,0.25)] bg-[#0e0e1a] p-3 text-sm shadow-2xl lg:hidden" onKeyDown={(event) => { if (event.key === 'Escape') { setAccountOpen(false); document.getElementById('mobile-account-button')?.focus(); } }}>
          {isMember && (
            <p className="mb-2 text-xs" style={{ color: '#c9a96e' }}>🖤 Sanctuary Member</p>
          )}
          <Link href="/join" onClick={() => setAccountOpen(false)} className="mb-2 block px-4 py-3 text-zinc-200">The Sanctuary</Link>
          <button
            onClick={() => {
              signOut();
              setAccountOpen(false);
            }}
            className="w-full rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-zinc-300 transition-colors hover:text-white"
          >
            Sign Out
          </button>
        </div>
      )}

      <nav aria-label="Mobile primary navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0b0a0c] pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-5 px-2 text-center text-[#bdb5a9]">
          {tabs.map((tab) => {
            const active = tab.href === '/' ? pathname === '/' : tab.href === '/shop' ? pathname.startsWith('/shop') || pathname.startsWith('/collections') : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setAccountOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`${tabClass} ${active ? 'text-[#e5c997]' : ''}`}
            >
              <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
              {tab.label}
            </Link>
          ); })}
          <button
            type="button"
            onClick={() => { setAccountOpen(false); setIsOpen(true); }}
            className={tabClass}
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
          >
            <ShoppingBag size={19} strokeWidth={1.5} aria-hidden="true" />
            Cart
            {itemCount > 0 && (
              <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B89C6D] px-0.5 text-[10px] font-medium text-black">
                {itemCount}
              </span>
            )}
          </button>
          <button
            id="mobile-account-button"
            type="button"
            onClick={handleAccountClick}
            className={tabClass}
            aria-expanded={user ? accountOpen : undefined}
            aria-controls={user && accountOpen ? 'mobile-account-menu' : undefined}
            aria-label={user ? "Account" : "Sign in"}
          >
            <UserRound size={19} strokeWidth={1.5} aria-hidden="true" />
            {user ? "Account" : "Sign In"}
            {isMember && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#c9a96e]" />
            )}
          </button>
        </div>
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode="signin" />
    </>
  );
}
