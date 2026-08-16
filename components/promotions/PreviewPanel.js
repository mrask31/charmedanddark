"use client";

import { useState } from "react";

/**
 * PreviewPanel — Side-by-side merchandising validation for Campaign Preview mode.
 *
 * Shows a collapsible panel at the bottom of the screen displaying:
 * - Promotion metadata (name, status, dates, priority)
 * - Before/After pricing comparison for the current page's products
 * - Badge preview
 * - Countdown preview
 *
 * Only renders when preview mode is active (never visible to public).
 *
 * Props:
 *   promotion: The previewed promotion object
 *   products: Array of { name, basePrice, salePrice, savings, percentage, badge } for current page
 */
export function PreviewPanel({ promotion, products = [] }) {
  const [expanded, setExpanded] = useState(true);

  if (!promotion) return null;

  const startDate = new Date(promotion.startDate || promotion.start_date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const endDate = new Date(promotion.endDate || promotion.end_date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9998] transition-transform duration-300"
      style={{
        transform: expanded ? "translateY(0)" : "translateY(calc(100% - 40px))",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Toggle bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-2 text-[11px] uppercase tracking-widest"
        style={{
          backgroundColor: "rgba(201, 169, 110, 0.95)",
          color: "#000",
          fontWeight: 600,
        }}
      >
        <span>Preview: {promotion.name || promotion.slug}</span>
        <span>{expanded ? "▼ Collapse" : "▲ Expand"}</span>
      </button>

      {/* Panel content */}
      <div
        className="overflow-auto"
        style={{
          backgroundColor: "rgba(14, 13, 20, 0.98)",
          borderTop: "1px solid rgba(201, 169, 110, 0.3)",
          maxHeight: "50vh",
        }}
      >
        {/* Promotion metadata row */}
        <div className="grid grid-cols-2 gap-4 px-6 py-4 text-xs sm:grid-cols-4 lg:grid-cols-6" style={{ color: "#a89a80" }}>
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Status</span>
            <span className="font-medium" style={{ color: statusColor(promotion.status) }}>
              {promotion.status}
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Type</span>
            {promotion.promotionType || promotion.promotion_type} —{" "}
            {promotion.percentage ? `${promotion.percentage}%` : `$${promotion.fixedAmount || promotion.fixed_amount}`}
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Priority</span>
            {promotion.priority || 0}
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Dates</span>
            {startDate} — {endDate}
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Badge</span>
            {promotion.badgeText || promotion.badge_text || "—"}
          </div>
          <div>
            <span className="block text-[9px] uppercase tracking-widest text-zinc-500 mb-1">Countdown</span>
            {(promotion.countdownEnabled || promotion.countdown_enabled) ? "Enabled" : "Off"}
          </div>
        </div>

        {/* Side-by-side pricing table */}
        {products.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 mb-2">
              Pricing Validation ({products.length} products on this page)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]" style={{ color: "#e8e4dc" }}>
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-2 pr-4 font-normal text-zinc-500">Product</th>
                    <th className="pb-2 pr-4 font-normal text-zinc-500">Before</th>
                    <th className="pb-2 pr-4 font-normal text-zinc-500">After</th>
                    <th className="pb-2 pr-4 font-normal text-zinc-500">Savings</th>
                    <th className="pb-2 pr-4 font-normal text-zinc-500">%</th>
                    <th className="pb-2 font-normal text-zinc-500">Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 20).map((p, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-1.5 pr-4 truncate max-w-[200px]">{p.name}</td>
                      <td className="py-1.5 pr-4 text-zinc-500 line-through">${p.basePrice?.toFixed(2)}</td>
                      <td className="py-1.5 pr-4 font-medium" style={{ color: "#c9a96e" }}>
                        ${p.salePrice?.toFixed(2)}
                      </td>
                      <td className="py-1.5 pr-4 text-green-400">${p.savings?.toFixed(2)}</td>
                      <td className="py-1.5 pr-4">{Math.round(p.percentage || 0)}%</td>
                      <td className="py-1.5">
                        {p.badge && (
                          <span
                            className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider"
                            style={{ backgroundColor: "#c9a96e", color: "#000" }}
                          >
                            {p.badge}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length > 20 && (
                <p className="mt-2 text-[10px] text-zinc-500">
                  Showing first 20 of {products.length} products.
                </p>
              )}
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="px-6 pb-4">
            <p className="text-[11px] text-zinc-500 italic">
              No products on this page match this promotion&apos;s targeting rules.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function statusColor(status) {
  switch (status) {
    case "draft": return "#6b6760";
    case "scheduled": return "#60a5fa";
    case "active": case "live": return "#4ade80";
    case "expired": return "#ef4444";
    case "archived": return "#6b7280";
    default: return "#a89a80";
  }
}
