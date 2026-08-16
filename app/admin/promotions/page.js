"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const API_SECRET = "charmed-dark-sync-2026";

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

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PromotionsPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const key = searchParams.get("key");
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (key === "charmed-dark-admin") fetchPromotions();
  }, [key]);

  if (key !== "charmed-dark-admin") return null;

  async function fetchPromotions() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promotions", {
        headers: { Authorization: `Bearer ${API_SECRET}` },
      });
      if (!res.ok) throw new Error("Failed to load promotions");
      const data = await res.json();
      setPromotions(data.promotions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive(id, name) {
    if (!confirm(`Archive "${name}"? This will disable the promotion.`)) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${API_SECRET}` },
      });
      if (!res.ok) throw new Error("Archive failed");
      fetchPromotions();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#08080F", color: "#e8e4dc", fontFamily: "Inter, sans-serif", padding: "2rem" }}>
      {/* Header */}
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.75rem", fontWeight: 400, margin: 0 }}>
              Promotions
            </h1>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a96e", marginTop: "0.25rem" }}>
              Campaign Management
            </p>
          </div>
          <button
            onClick={() => router.push(`/admin/promotions/new?key=${key}`)}
            style={{
              padding: "0.6rem 1.5rem", fontSize: "0.75rem", fontWeight: 400, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#000", backgroundColor: "#c9a96e", border: "none",
              cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}
          >
            + New Promotion
          </button>
        </div>

        {/* Loading / Error */}
        {loading && <p style={{ color: "#6b6760", fontSize: "0.85rem" }}>Loading promotions...</p>}
        {error && <p style={{ color: "#e55", fontSize: "0.85rem" }}>{error}</p>}

        {/* Promotions Table */}
        {!loading && promotions.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#6b6760" }}>
            <p style={{ fontSize: "0.9rem", fontStyle: "italic" }}>No promotions yet.</p>
            <p style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>Create your first campaign to get started.</p>
          </div>
        )}

        {!loading && promotions.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(201,169,110,0.2)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 0.5rem", color: "#6b6760", fontWeight: 400, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Name</th>
                  <th style={{ padding: "0.75rem 0.5rem", color: "#6b6760", fontWeight: 400, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "0.75rem 0.5rem", color: "#6b6760", fontWeight: 400, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Discount</th>
                  <th style={{ padding: "0.75rem 0.5rem", color: "#6b6760", fontWeight: 400, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Dates</th>
                  <th style={{ padding: "0.75rem 0.5rem", color: "#6b6760", fontWeight: 400, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Priority</th>
                  <th style={{ padding: "0.75rem 0.5rem", color: "#6b6760", fontWeight: 400, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "#6b6760", marginTop: "0.15rem" }}>{p.slug}</div>
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <span style={{ color: statusColor(p.status), fontSize: "0.7rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      {p.promotion_type === "percentage" ? `${p.percentage}%` : `$${p.fixed_amount}`}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", fontSize: "0.75rem", color: "#a89a80" }}>
                      {formatDate(p.start_date)} — {formatDate(p.end_date)}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                      {p.priority || 0}
                    </td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => router.push(`/admin/promotions/${p.id}?key=${key}`)}
                          style={{ fontSize: "0.7rem", color: "#c9a96e", background: "none", border: "1px solid rgba(201,169,110,0.3)", padding: "0.3rem 0.6rem", cursor: "pointer" }}
                        >
                          Edit
                        </button>
                        {p.status !== "archived" && (
                          <button
                            onClick={() => handleArchive(p.id, p.name)}
                            style={{ fontSize: "0.7rem", color: "#6b6760", background: "none", border: "1px solid rgba(255,255,255,0.1)", padding: "0.3rem 0.6rem", cursor: "pointer" }}
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPromotionsPage() {
  return (
    <Suspense fallback={null}>
      <PromotionsPanel />
    </Suspense>
  );
}
