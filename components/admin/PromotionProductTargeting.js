"use client";

import { useEffect, useMemo, useState } from "react";

export default function PromotionProductTargeting({ targetedProducts, onAdd, onRemove }) {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [mutatingId, setMutatingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/products", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load products");
        if (!cancelled) setCatalog(data.products || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCatalog();
    return () => { cancelled = true; };
  }, []);

  const selectedIds = useMemo(
    () => new Set((targetedProducts || []).map((row) => row.product_id)),
    [targetedProducts]
  );

  const catalogById = useMemo(
    () => new Map(catalog.map((product) => [product.id, product])),
    [catalog]
  );

  const selectedProducts = useMemo(
    () => (targetedProducts || []).map((row) => ({
      id: row.product_id,
      ...catalogById.get(row.product_id),
    })),
    [targetedProducts, catalogById]
  );

  const searchResults = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return catalog
      .filter((product) => !selectedIds.has(product.id))
      .filter((product) => {
        if (!needle) return true;
        return `${product.name} ${product.category || ""} ${product.slug || ""}`
          .toLowerCase()
          .includes(needle);
      })
      .slice(0, 20);
  }, [catalog, search, selectedIds]);

  async function mutate(productId, action) {
    setMutatingId(productId);
    setError(null);
    try {
      if (action === "add") await onAdd(productId);
      else await onRemove(productId);
    } catch (err) {
      setError(err.message || "Unable to update product targeting");
    } finally {
      setMutatingId(null);
    }
  }

  const smallText = { fontSize: "0.7rem", color: "#6b6760", lineHeight: 1.45 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem", marginBottom: "0.75rem" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "#e8e4dc" }}>
            {selectedProducts.length} product{selectedProducts.length === 1 ? "" : "s"} selected
          </p>
          <p style={{ ...smallText, margin: "0.2rem 0 0" }}>Review the exact assortment before publishing.</p>
        </div>
      </div>

      {loading && <p style={smallText}>Loading product names…</p>}
      {error && <p role="alert" style={{ color: "#ef4444", fontSize: "0.72rem" }}>{error}</p>}

      {!loading && selectedProducts.length > 0 && (
        <div style={{ display: "grid", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {selectedProducts.map((product) => {
            const missing = !product.name;
            return (
              <div
                key={product.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px minmax(0, 1fr) auto",
                  gap: "0.75rem",
                  alignItems: "center",
                  padding: "0.55rem",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backgroundColor: "rgba(8,8,15,0.55)",
                }}
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" style={{ width: 44, height: 44, objectFit: "cover", backgroundColor: "#11111a" }} />
                ) : (
                  <div style={{ width: 44, height: 44, display: "grid", placeItems: "center", backgroundColor: "#11111a", color: "#6b6760", fontSize: "0.6rem" }}>No image</div>
                )}
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: missing ? "#ef4444" : "#e8e4dc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {missing ? `Unknown product (${product.id.slice(0, 8)}…)` : product.name}
                  </p>
                  {!missing && (
                    <p style={{ ...smallText, margin: "0.15rem 0 0" }}>
                      {product.category || "Uncategorized"}{product.price == null ? "" : ` · $${product.price.toFixed(2)}`}{product.isAvailable === false ? " · Unavailable" : ""}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => mutate(product.id, "remove")}
                  disabled={mutatingId === product.id}
                  style={{ padding: "0.35rem 0.55rem", fontSize: "0.65rem", color: "#ef4444", background: "none", border: "1px solid rgba(239,68,68,0.25)", cursor: mutatingId === product.id ? "not-allowed" : "pointer" }}
                >
                  {mutatingId === product.id ? "…" : "Remove"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <label htmlFor="promotion-product-search" style={{ display: "block", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "0.4rem" }}>
        Add products
      </label>
      <input
        id="promotion-product-search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by product name or category…"
        style={{ width: "100%", boxSizing: "border-box", padding: "0.65rem 0.75rem", fontSize: "0.8rem", backgroundColor: "#0e0e1a", border: "1px solid rgba(201,169,110,0.2)", color: "#e8e4dc", outline: "none" }}
      />

      {!loading && (
        <div style={{ maxHeight: "280px", overflowY: "auto", marginTop: "0.5rem", border: searchResults.length ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
          {searchResults.map((product) => (
            <div key={product.id} style={{ display: "grid", gridTemplateColumns: "36px minmax(0, 1fr) auto", gap: "0.65rem", alignItems: "center", padding: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: "cover", backgroundColor: "#11111a" }} />
              ) : <div style={{ width: 36, height: 36, backgroundColor: "#11111a" }} />}
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
                <p style={{ ...smallText, margin: "0.12rem 0 0" }}>{product.category || "Uncategorized"}{product.price == null ? "" : ` · $${product.price.toFixed(2)}`}</p>
              </div>
              <button
                type="button"
                onClick={() => mutate(product.id, "add")}
                disabled={mutatingId === product.id}
                style={{ padding: "0.35rem 0.55rem", fontSize: "0.65rem", color: "#c9a96e", background: "none", border: "1px solid rgba(201,169,110,0.3)", cursor: mutatingId === product.id ? "not-allowed" : "pointer" }}
              >
                {mutatingId === product.id ? "…" : "Add"}
              </button>
            </div>
          ))}
          {search.trim() && searchResults.length === 0 && <p style={{ ...smallText, padding: "0.5rem", margin: 0 }}>No matching products.</p>}
        </div>
      )}
    </div>
  );
}
