"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
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

function EditPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const key = searchParams.get("key");
  const id = params.id;

  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Targeting state
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [newCollection, setNewCollection] = useState("");
  const [newTag, setNewTag] = useState("");

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => { if (key === "charmed-dark-admin") fetchPromotion(); }, [id, key]);

  if (key !== "charmed-dark-admin") return null;

  async function fetchPromotion() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        headers: { Authorization: `Bearer ${API_SECRET}` },
      });
      if (!res.ok) throw new Error("Promotion not found");
      const data = await res.json();
      setPromo(data);
      setProducts(data.products?.filter((p) => !p.excluded) || []);
      setCollections(data.collections?.map((c) => c.collection) || []);
      setTags(data.tags?.map((t) => t.tag) || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(field, value) {
    setSaving(true);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${API_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = await res.json();
      setPromo(updated);
      setSuccess(`Updated ${field}`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!confirm("Publish this promotion? It will become visible to customers.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/promotions/${id}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_SECRET}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setSuccess(data.message);
      fetchPromotion();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Product Search ──
  async function handleProductSearch() {
    if (!productSearch.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/promotions?search=${encodeURIComponent(productSearch)}`, {
        headers: { Authorization: `Bearer ${API_SECRET}` },
      });
      // Use a direct Supabase query for product search via a simple endpoint
      // For v1, we'll search products by name from the existing product list
      const prodRes = await fetch(`/api/google-feed`);
      // Actually, let's do a simpler approach — query products via supabase from the client
      // Since this admin page already has the secret, we'll use a lightweight approach
      setSearchResults([]); // Will implement below
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }

  async function handleAddProduct(productId) {
    try {
      const res = await fetch(`/api/admin/promotions/${id}/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({ add: [productId] }),
      });
      if (!res.ok) throw new Error("Failed to add product");
      fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveProduct(productId) {
    try {
      const res = await fetch(`/api/admin/promotions/${id}/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({ remove: [productId] }),
      });
      if (!res.ok) throw new Error("Failed to remove product");
      fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddCollection() {
    if (!newCollection.trim()) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}/collections`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({ add: [newCollection.trim()] }),
      });
      if (!res.ok) throw new Error("Failed to add collection");
      setNewCollection("");
      fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveCollection(collection) {
    try {
      const res = await fetch(`/api/admin/promotions/${id}/collections`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({ remove: [collection] }),
      });
      if (!res.ok) throw new Error("Failed to remove collection");
      fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddTag() {
    if (!newTag.trim()) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}/tags`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({ add: [newTag.trim()] }),
      });
      if (!res.ok) throw new Error("Failed to add tag");
      setNewTag("");
      fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveTag(tag) {
    try {
      const res = await fetch(`/api/admin/promotions/${id}/tags`, {
        method: "POST",
        headers: { Authorization: `Bearer ${API_SECRET}`, "Content-Type": "application/json" },
        body: JSON.stringify({ remove: [tag] }),
      });
      if (!res.ok) throw new Error("Failed to remove tag");
      fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div style={{ minHeight: "100vh", backgroundColor: "#08080F", color: "#6b6760", padding: "2rem", fontFamily: "Inter, sans-serif" }}>Loading...</div>;
  if (!promo) return <div style={{ minHeight: "100vh", backgroundColor: "#08080F", color: "#e55", padding: "2rem", fontFamily: "Inter, sans-serif" }}>Promotion not found</div>;

  const inputStyle = {
    width: "100%", padding: "0.6rem 0.75rem", fontSize: "0.8rem", fontFamily: "Inter, sans-serif",
    backgroundColor: "#0e0e1a", border: "1px solid rgba(201,169,110,0.2)", color: "#e8e4dc", outline: "none",
  };
  const labelStyle = { fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a96e", display: "block", marginBottom: "0.4rem" };
  const sectionStyle = { marginBottom: "2.5rem", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(14,14,26,0.5)" };
  const chipStyle = { display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.7rem", fontSize: "0.7rem", backgroundColor: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)", color: "#c9a96e" };

  const previewUrl = `/?preview_promotion=${promo.slug}&preview_secret=${typeof window !== 'undefined' ? (prompt.__preview_secret || 'YOUR_SECRET') : ''}`;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#08080F", color: "#e8e4dc", fontFamily: "Inter, sans-serif", padding: "2rem" }}>
      <div style={{ maxWidth: "750px", margin: "0 auto" }}>
        {/* Navigation */}
        <button onClick={() => router.push(`/admin/promotions?key=${key}`)} style={{ fontSize: "0.7rem", color: "#6b6760", background: "none", border: "none", cursor: "pointer", marginBottom: "1rem" }}>
          ← Back to Promotions
        </button>

        {/* Header with status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.5rem", fontWeight: 400, margin: 0 }}>
              {promo.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
              <span style={{ color: statusColor(promo.status), fontSize: "0.7rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {promo.status}
              </span>
              <span style={{ fontSize: "0.7rem", color: "#6b6760" }}>
                {promo.promotion_type === "percentage" ? `${promo.percentage}% off` : `$${promo.fixed_amount} off`}
              </span>
              <span style={{ fontSize: "0.7rem", color: "#6b6760" }}>
                Priority: {promo.priority || 0}
              </span>
            </div>
          </div>

          {/* Publish Button */}
          {(promo.status === "draft" || promo.status === "scheduled") && (
            <button
              onClick={handlePublish}
              disabled={saving}
              style={{
                padding: "0.6rem 1.5rem", fontSize: "0.75rem", fontWeight: 400, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "#000", backgroundColor: "#4ade80", border: "none",
                cursor: saving ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif",
              }}
            >
              {saving ? "..." : "Publish"}
            </button>
          )}
        </div>

        {/* Status messages */}
        {error && <p style={{ color: "#e55", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</p>}
        {success && <p style={{ color: "#4ade80", fontSize: "0.8rem", marginBottom: "1rem" }}>{success}</p>}

        {/* Preview Link */}
        <div style={{ ...sectionStyle, borderColor: "rgba(201,169,110,0.2)" }}>
          <p style={labelStyle}>Preview Link</p>
          <p style={{ fontSize: "0.75rem", color: "#a89a80", wordBreak: "break-all" }}>
            Add <code style={{ color: "#c9a96e" }}>?preview_promotion={promo.slug}&preview_secret=YOUR_SECRET</code> to any page URL to preview this promotion.
          </p>
          <p style={{ fontSize: "0.65rem", color: "#6b6760", marginTop: "0.5rem" }}>
            Replace YOUR_SECRET with your PROMOTION_PREVIEW_SECRET env var value.
          </p>
        </div>

        {/* ── Targeting: Collections ── */}
        {(promo.applies_to === "collection" || promo.applies_to === "all") && (
          <div style={sectionStyle}>
            <p style={labelStyle}>Collection Targeting</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {collections.length === 0 && <span style={{ fontSize: "0.75rem", color: "#6b6760", fontStyle: "italic" }}>No collections targeted</span>}
              {collections.map((c) => (
                <span key={c} style={chipStyle}>
                  {c}
                  <button onClick={() => handleRemoveCollection(c)} style={{ background: "none", border: "none", color: "#e55", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <select style={inputStyle} value={newCollection} onChange={(e) => setNewCollection(e.target.value)}>
                <option value="">Select category...</option>
                <option value="Accessories">Accessories</option>
                <option value="Ritual">Ritual (Candles)</option>
                <option value="Home Decor">Home Decor</option>
                <option value="Apparel">Apparel</option>
                <option value="Wall Art">Wall Art</option>
              </select>
              <button onClick={handleAddCollection} style={{ padding: "0 1rem", fontSize: "0.75rem", color: "#c9a96e", backgroundColor: "transparent", border: "1px solid rgba(201,169,110,0.3)", cursor: "pointer", whiteSpace: "nowrap" }}>
                Add
              </button>
            </div>
          </div>
        )}

        {/* ── Targeting: Tags ── */}
        {(promo.applies_to === "tag" || promo.applies_to === "all") && (
          <div style={sectionStyle}>
            <p style={labelStyle}>Tag Targeting</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {tags.length === 0 && <span style={{ fontSize: "0.75rem", color: "#6b6760", fontStyle: "italic" }}>No tags targeted</span>}
              {tags.map((t) => (
                <span key={t} style={chipStyle}>
                  {t}
                  <button onClick={() => handleRemoveTag(t)} style={{ background: "none", border: "none", color: "#e55", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input style={inputStyle} value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="e.g. summerween, bags, candle" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} />
              <button onClick={handleAddTag} style={{ padding: "0 1rem", fontSize: "0.75rem", color: "#c9a96e", backgroundColor: "transparent", border: "1px solid rgba(201,169,110,0.3)", cursor: "pointer", whiteSpace: "nowrap" }}>
                Add
              </button>
            </div>
          </div>
        )}

        {/* ── Targeting: Specific Products ── */}
        {promo.applies_to === "specific" && (
          <div style={sectionStyle}>
            <p style={labelStyle}>Product Targeting</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {products.length === 0 && <span style={{ fontSize: "0.75rem", color: "#6b6760", fontStyle: "italic" }}>No products targeted. Add products below.</span>}
              {products.map((p) => (
                <span key={p.product_id} style={chipStyle}>
                  {p.product_id.slice(0, 8)}...
                  <button onClick={() => handleRemoveProduct(p.product_id)} style={{ background: "none", border: "none", color: "#e55", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <p style={{ fontSize: "0.7rem", color: "#6b6760", marginBottom: "0.5rem" }}>
              To add products, use the product UUID from Supabase. You can find product IDs in the Supabase Dashboard or via the API.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input style={inputStyle} value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Paste product UUID..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddProduct(productSearch.trim()); setProductSearch(""); } }} />
              <button onClick={() => { handleAddProduct(productSearch.trim()); setProductSearch(""); }} style={{ padding: "0 1rem", fontSize: "0.75rem", color: "#c9a96e", backgroundColor: "transparent", border: "1px solid rgba(201,169,110,0.3)", cursor: "pointer", whiteSpace: "nowrap" }}>
                Add
              </button>
            </div>
          </div>
        )}

        {/* ── Quick Edit Fields ── */}
        <div style={sectionStyle}>
          <p style={labelStyle}>Quick Edit</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ ...labelStyle, fontSize: "0.6rem" }}>Badge Text</label>
              <input
                style={inputStyle}
                defaultValue={promo.badge_text || ""}
                onBlur={(e) => { if (e.target.value !== (promo.badge_text || "")) handleSave("badge_text", e.target.value); }}
              />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: "0.6rem" }}>Priority</label>
              <input
                style={inputStyle}
                type="number"
                defaultValue={promo.priority || 0}
                onBlur={(e) => { if (parseInt(e.target.value) !== (promo.priority || 0)) handleSave("priority", parseInt(e.target.value)); }}
              />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: "0.6rem" }}>Hero Title</label>
              <input
                style={inputStyle}
                defaultValue={promo.hero_title || ""}
                onBlur={(e) => { if (e.target.value !== (promo.hero_title || "")) handleSave("hero_title", e.target.value); }}
              />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: "0.6rem" }}>Hero Subtitle</label>
              <input
                style={inputStyle}
                defaultValue={promo.hero_subtitle || ""}
                onBlur={(e) => { if (e.target.value !== (promo.hero_subtitle || "")) handleSave("hero_subtitle", e.target.value); }}
              />
            </div>
          </div>
        </div>

        {/* ── Danger Zone ── */}
        {promo.status !== "archived" && (
          <div style={{ ...sectionStyle, borderColor: "rgba(239,68,68,0.2)" }}>
            <p style={{ ...labelStyle, color: "#ef4444" }}>Danger Zone</p>
            <button
              onClick={async () => {
                if (!confirm("Archive this promotion? It will be disabled and hidden from customers.")) return;
                await fetch(`/api/admin/promotions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${API_SECRET}` } });
                router.push(`/admin/promotions?key=${key}`);
              }}
              style={{ fontSize: "0.7rem", color: "#ef4444", background: "none", border: "1px solid rgba(239,68,68,0.3)", padding: "0.4rem 1rem", cursor: "pointer" }}
            >
              Archive Promotion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditPromotionPage() {
  return (
    <Suspense fallback={null}>
      <EditPanel />
    </Suspense>
  );
}
