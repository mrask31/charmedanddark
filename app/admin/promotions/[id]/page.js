"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [promo, setPromo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [tags, setTags] = useState([]);
  const [newCollection, setNewCollection] = useState("");
  const [newTag, setNewTag] = useState("");
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    fetchPromotion();
  }, [id]);

  async function fetchPromotion() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Promotion not found");
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
    setError(null);
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setPromo(data);
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
    setError(null);
    try {
      const res = await fetch(`/api/admin/promotions/${id}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setSuccess(data.message);
      await fetchPromotion();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddProduct(productId) {
    if (!productId) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ add: [productId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add product");
      setProductSearch("");
      await fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveProduct(productId) {
    try {
      const res = await fetch(`/api/admin/promotions/${id}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove: [productId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove product");
      await fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddCollection() {
    if (!newCollection.trim()) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}/collections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ add: [newCollection.trim()] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add collection");
      setNewCollection("");
      await fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveCollection(collection) {
    try {
      const res = await fetch(`/api/admin/promotions/${id}/collections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove: [collection] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove collection");
      await fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddTag() {
    if (!newTag.trim()) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ add: [newTag.trim()] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add tag");
      setNewTag("");
      await fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveTag(tag) {
    try {
      const res = await fetch(`/api/admin/promotions/${id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remove: [tag] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove tag");
      await fetchPromotion();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleArchive() {
    if (!confirm("Archive this promotion? It will be disabled and hidden from customers.")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Archive failed");
      router.push("/admin/promotions");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#08080F", color: "#6b6760", padding: "2rem", fontFamily: "Inter, sans-serif" }}>Loading...</div>;
  }

  if (!promo) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#08080F", color: "#e55", padding: "2rem", fontFamily: "Inter, sans-serif" }}>{error || "Promotion not found"}</div>;
  }

  const inputStyle = {
    width: "100%", padding: "0.6rem 0.75rem", fontSize: "0.8rem", fontFamily: "Inter, sans-serif",
    backgroundColor: "#0e0e1a", border: "1px solid rgba(201,169,110,0.2)", color: "#e8e4dc", outline: "none",
  };
  const labelStyle = { fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a96e", display: "block", marginBottom: "0.4rem" };
  const sectionStyle = { marginBottom: "2.5rem", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(14,14,26,0.5)" };
  const chipStyle = { display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.7rem", fontSize: "0.7rem", backgroundColor: "rgba(201,169,110,0.1)", border: "1px solid rgba(201,169,110,0.2)", color: "#c9a96e" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#08080F", color: "#e8e4dc", fontFamily: "Inter, sans-serif", padding: "2rem" }}>
      <div style={{ maxWidth: "750px", margin: "0 auto" }}>
        <button onClick={() => router.push("/admin/promotions")} style={{ fontSize: "0.7rem", color: "#6b6760", background: "none", border: "none", cursor: "pointer", marginBottom: "1rem" }}>
          ← Back to Promotions
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.5rem", fontWeight: 400, margin: 0 }}>{promo.name}</h1>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
              <span style={{ color: statusColor(promo.status), fontSize: "0.7rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em" }}>{promo.status}</span>
              <span style={{ fontSize: "0.7rem", color: "#6b6760" }}>{promo.promotion_type === "percentage" ? `${promo.percentage}% off` : `$${promo.fixed_amount} off`}</span>
              <span style={{ fontSize: "0.7rem", color: "#6b6760" }}>Priority: {promo.priority || 0}</span>
            </div>
          </div>
          {(promo.status === "draft" || promo.status === "scheduled") && (
            <button
              onClick={handlePublish}
              disabled={saving}
              style={{ padding: "0.6rem 1.5rem", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#000", backgroundColor: "#4ade80", border: "none", cursor: saving ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif" }}
            >
              {saving ? "..." : "Publish"}
            </button>
          )}
        </div>

        {error && <p role="alert" style={{ color: "#e55", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</p>}
        {success && <p role="status" style={{ color: "#4ade80", fontSize: "0.8rem", marginBottom: "1rem" }}>{success}</p>}

        <div style={{ ...sectionStyle, borderColor: "rgba(201,169,110,0.2)" }}>
          <p style={labelStyle}>Preview</p>
          <p style={{ fontSize: "0.75rem", color: "#a89a80", lineHeight: 1.6 }}>
            Promotion previews remain protected by the server-side <code style={{ color: "#c9a96e" }}>PROMOTION_PREVIEW_SECRET</code>. Do not place preview secrets in saved links or public messages.
          </p>
        </div>

        {(promo.applies_to === "collection" || promo.applies_to === "all") && (
          <div style={sectionStyle}>
            <p style={labelStyle}>Collection Targeting</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {collections.length === 0 && <span style={{ fontSize: "0.75rem", color: "#6b6760", fontStyle: "italic" }}>No collections targeted</span>}
              {collections.map((c) => (
                <span key={c} style={chipStyle}>{c}<button onClick={() => handleRemoveCollection(c)} aria-label={`Remove ${c}`} style={{ background: "none", border: "none", color: "#e55", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1 }}>×</button></span>
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
              <button onClick={handleAddCollection} style={{ padding: "0 1rem", fontSize: "0.75rem", color: "#c9a96e", backgroundColor: "transparent", border: "1px solid rgba(201,169,110,0.3)", cursor: "pointer", whiteSpace: "nowrap" }}>Add</button>
            </div>
          </div>
        )}

        {(promo.applies_to === "tag" || promo.applies_to === "all") && (
          <div style={sectionStyle}>
            <p style={labelStyle}>Tag Targeting</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {tags.length === 0 && <span style={{ fontSize: "0.75rem", color: "#6b6760", fontStyle: "italic" }}>No tags targeted</span>}
              {tags.map((t) => (
                <span key={t} style={chipStyle}>{t}<button onClick={() => handleRemoveTag(t)} aria-label={`Remove ${t}`} style={{ background: "none", border: "none", color: "#e55", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1 }}>×</button></span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input style={inputStyle} value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="e.g. summerween, bags, candle" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} />
              <button onClick={handleAddTag} style={{ padding: "0 1rem", fontSize: "0.75rem", color: "#c9a96e", backgroundColor: "transparent", border: "1px solid rgba(201,169,110,0.3)", cursor: "pointer", whiteSpace: "nowrap" }}>Add</button>
            </div>
          </div>
        )}

        {promo.applies_to === "specific" && (
          <div style={sectionStyle}>
            <p style={labelStyle}>Product Targeting</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {products.length === 0 && <span style={{ fontSize: "0.75rem", color: "#6b6760", fontStyle: "italic" }}>No products targeted. Add products below.</span>}
              {products.map((p) => (
                <span key={p.product_id} style={chipStyle}>{p.product_id.slice(0, 8)}...<button onClick={() => handleRemoveProduct(p.product_id)} aria-label={`Remove product ${p.product_id}`} style={{ background: "none", border: "none", color: "#e55", cursor: "pointer", fontSize: "0.8rem", lineHeight: 1 }}>×</button></span>
              ))}
            </div>
            <p style={{ fontSize: "0.7rem", color: "#6b6760", marginBottom: "0.5rem" }}>Paste a product UUID from the product catalog.</p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input style={inputStyle} value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Product UUID..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddProduct(productSearch.trim()); } }} />
              <button onClick={() => handleAddProduct(productSearch.trim())} style={{ padding: "0 1rem", fontSize: "0.75rem", color: "#c9a96e", backgroundColor: "transparent", border: "1px solid rgba(201,169,110,0.3)", cursor: "pointer", whiteSpace: "nowrap" }}>Add</button>
            </div>
          </div>
        )}

        <div style={sectionStyle}>
          <p style={labelStyle}>Quick Edit</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <div>
              <label style={{ ...labelStyle, fontSize: "0.6rem" }}>Badge Text</label>
              <input style={inputStyle} defaultValue={promo.badge_text || ""} onBlur={(e) => { if (e.target.value !== (promo.badge_text || "")) handleSave("badge_text", e.target.value); }} />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: "0.6rem" }}>Priority</label>
              <input style={inputStyle} type="number" defaultValue={promo.priority || 0} onBlur={(e) => { const value = parseInt(e.target.value, 10) || 0; if (value !== (promo.priority || 0)) handleSave("priority", value); }} />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: "0.6rem" }}>Hero Title</label>
              <input style={inputStyle} defaultValue={promo.hero_title || ""} onBlur={(e) => { if (e.target.value !== (promo.hero_title || "")) handleSave("hero_title", e.target.value); }} />
            </div>
            <div>
              <label style={{ ...labelStyle, fontSize: "0.6rem" }}>Hero Subtitle</label>
              <input style={inputStyle} defaultValue={promo.hero_subtitle || ""} onBlur={(e) => { if (e.target.value !== (promo.hero_subtitle || "")) handleSave("hero_subtitle", e.target.value); }} />
            </div>
          </div>
        </div>

        {promo.status !== "archived" && (
          <div style={{ ...sectionStyle, borderColor: "rgba(239,68,68,0.2)" }}>
            <p style={{ ...labelStyle, color: "#ef4444" }}>Danger Zone</p>
            <button onClick={handleArchive} disabled={saving} style={{ fontSize: "0.7rem", color: "#ef4444", background: "none", border: "1px solid rgba(239,68,68,0.3)", padding: "0.4rem 1rem", cursor: saving ? "not-allowed" : "pointer" }}>
              Archive Promotion
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
