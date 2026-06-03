"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/drops", label: "Drops" },
  { href: "/join", label: "Join" },
];

export default function MobileTabNav() {
  const { isOpen, setIsOpen, itemCount } = useCart();
  const { user, isMember, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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
        <div className="fixed bottom-[70px] right-3 z-50 w-52 border border-[rgba(201,169,110,0.25)] bg-[#0e0e1a] p-3 text-sm shadow-2xl md:hidden">
          {isMember && (
            <p className="mb-2 text-xs" style={{ color: '#c9a96e' }}>🖤 Sanctuary Member</p>
          )}
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black md:hidden">
        <div className="mx-auto grid max-w-5xl grid-cols-6 gap-1 px-2 py-3 text-center text-[11px] text-white/70">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-full px-1 py-2 transition-colors hover:text-white"
            >
              {tab.label}
            </Link>
          ))}
          <button
            onClick={() => setIsOpen(true)}
            className="relative rounded-full px-1 py-2 transition-colors hover:text-white"
          >
            Cart
            {itemCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#B89C6D] text-[10px] font-medium text-black">
                {itemCount}
              </span>
            )}
          </button>
          <button
            onClick={handleAccountClick}
            className="relative rounded-full px-1 py-2 transition-colors hover:text-white"
            aria-label={user ? "Account" : "Sign in"}
          >
            {user ? "Acct" : "Sign In"}
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
