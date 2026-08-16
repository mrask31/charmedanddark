"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PROMOTION_ENGINE_ENABLED } from "@/lib/promotions/config";

/**
 * SaleNavItem — Conditional "SALE" navigation link.
 *
 * Only renders when the promotion engine is enabled AND an active promotion
 * with nav_enabled=true exists. Fetches from /api/promotions/active.
 *
 * Disappears automatically when no active promotions exist.
 */
export function SaleNavItem() {
  const [visible, setVisible] = useState(false);
  const [accentColor, setAccentColor] = useState("#c9a96e");

  useEffect(() => {
    if (!PROMOTION_ENGINE_ENABLED) return;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/promotions/active");
        if (!res.ok || cancelled) return;
        const { promotions } = await res.json();
        const navPromo = promotions?.find((p) => p.navEnabled);
        if (navPromo && !cancelled) {
          setVisible(true);
          setAccentColor(navPromo.accentColor || "#c9a96e");
        }
      } catch {
        // Silently fail — no SALE link shown
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/sale"
      className="text-sm font-medium transition-opacity hover:opacity-80"
      style={{ color: accentColor }}
    >
      Sale
    </Link>
  );
}
