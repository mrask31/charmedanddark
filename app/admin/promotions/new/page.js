"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPromotionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    promotion_type: "percentage",
    percentage: "40",
    fixed_amount: "",
    applies_to: "specific",
    start_date: "",
    end_date: "",
    priority: "10",
    badge_text: "",
    hero_title: "",
    hero_subtitle: "",
    hero_cta_text: "Shop the Sale",
    hero_cta_url: "/sale",
    accent_color: "#c9a96e",
    homepage_enabled: true,
    countdown_enabled: false,
    landing_page_enabled: true,
    nav_enabled: true,
    seo_title: "",
    seo_description: "",
  });

  function handleChange(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "name" && !current.slug) {
        next.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      }
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const body = {
        ...form,
        percentage: form.promotion_type === "percentage" ? parseFloat(form.percentage) : null,
        fixed_amount: form.promotion_type === "fixed_amount" ? parseFloat(form.fixed_amount) : null,
        priority: parseInt(form.priority, 10) || 0,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      };

      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");

      router.push(`/admin/promotions/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "0.6rem 0.75rem", fontSize: "0.8rem", fontFamily: "Inter, sans-serif",
    backgroundColor: "#0e0e1a", border: "1px solid rgba(201,169,110,0.2)", color: "#e8e4dc", outline: "none",
  };
  const labelStyle = { fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a96e", display: "block", marginBottom: "0.4rem" };
  const sectionStyle = { marginBottom: "2rem" };
  const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#08080F", color: "#e8e4dc", fontFamily: "Inter, sans-serif", padding: "2rem" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <button onClick={() => router.push("/admin/promotions")} style={{ fontSize: "0.7rem", color: "#6b6760", background: "none", border: "none", cursor: "pointer", marginBottom: "1rem" }}>
          ← Back to Promotions
        </button>

        <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.25rem" }}>
          New Promotion
        </h1>
        <p style={{ fontSize: "0.7rem", color: "#6b6760", marginBottom: "2rem" }}>
          Configure your campaign. You can add product targeting after creation.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={sectionStyle}>
            <p style={{ ...labelStyle, marginBottom: "1rem", fontSize: "0.7rem" }}>Identity</p>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Name</label>
                <input style={inputStyle} value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Summerween Flash Sale" required />
              </div>
              <div>
                <label style={labelStyle}>Slug</label>
                <input style={inputStyle} value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} placeholder="summerween-flash-2026" required />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <p style={{ ...labelStyle, marginBottom: "1rem", fontSize: "0.7rem" }}>Discount</p>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Type</label>
                <select style={inputStyle} value={form.promotion_type} onChange={(e) => handleChange("promotion_type", e.target.value)}>
                  <option value="percentage">Percentage Off</option>
                  <option value="fixed_amount">Fixed Amount Off</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{form.promotion_type === "percentage" ? "Percentage" : "Amount ($)"}</label>
                {form.promotion_type === "percentage" ? (
                  <input style={inputStyle} type="number" min="1" max="100" value={form.percentage} onChange={(e) => handleChange("percentage", e.target.value)} required />
                ) : (
                  <input style={inputStyle} type="number" min="0.01" step="0.01" value={form.fixed_amount} onChange={(e) => handleChange("fixed_amount", e.target.value)} required />
                )}
              </div>
            </div>
            <div style={{ ...gridStyle, marginTop: "1rem" }}>
              <div>
                <label style={labelStyle}>Applies To</label>
                <select style={inputStyle} value={form.applies_to} onChange={(e) => handleChange("applies_to", e.target.value)}>
                  <option value="specific">Specific Products</option>
                  <option value="collection">Collections / Categories</option>
                  <option value="tag">Product Tags</option>
                  <option value="all">All Products</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <input style={inputStyle} type="number" value={form.priority} onChange={(e) => handleChange("priority", e.target.value)} placeholder="10" />
                <p style={{ fontSize: "0.6rem", color: "#6b6760", marginTop: "0.25rem" }}>Higher wins conflicts</p>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <p style={{ ...labelStyle, marginBottom: "1rem", fontSize: "0.7rem" }}>Schedule</p>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input style={inputStyle} type="datetime-local" value={form.start_date} onChange={(e) => handleChange("start_date", e.target.value)} required />
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input style={inputStyle} type="datetime-local" value={form.end_date} onChange={(e) => handleChange("end_date", e.target.value)} required />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <p style={{ ...labelStyle, marginBottom: "1rem", fontSize: "0.7rem" }}>Presentation</p>
            <div style={gridStyle}>
              <div>
                <label style={labelStyle}>Badge Text</label>
                <input style={inputStyle} value={form.badge_text} onChange={(e) => handleChange("badge_text", e.target.value)} placeholder="40% OFF" />
              </div>
              <div>
                <label style={labelStyle}>Accent Color</label>
                <input style={{ ...inputStyle, height: "36px" }} type="color" value={form.accent_color} onChange={(e) => handleChange("accent_color", e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Hero Title</label>
              <input style={inputStyle} value={form.hero_title} onChange={(e) => handleChange("hero_title", e.target.value)} placeholder="SUMMERWEEN SALE" />
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>Hero Subtitle</label>
              <input style={inputStyle} value={form.hero_subtitle} onChange={(e) => handleChange("hero_subtitle", e.target.value)} placeholder="Save up to 40% on select items" />
            </div>
            <div style={{ ...gridStyle, marginTop: "1rem" }}>
              <div>
                <label style={labelStyle}>CTA Text</label>
                <input style={inputStyle} value={form.hero_cta_text} onChange={(e) => handleChange("hero_cta_text", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>CTA URL</label>
                <input style={inputStyle} value={form.hero_cta_url} onChange={(e) => handleChange("hero_cta_url", e.target.value)} />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <p style={{ ...labelStyle, marginBottom: "1rem", fontSize: "0.7rem" }}>Features</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
              {[
                ["homepage_enabled", "Show on Homepage"],
                ["countdown_enabled", "Show Countdown"],
                ["landing_page_enabled", "Show on /sale"],
                ["nav_enabled", "Show SALE in Nav"],
              ].map(([field, label]) => (
                <label key={field} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#a89a80", cursor: "pointer" }}>
                  <input type="checkbox" checked={form[field]} onChange={(e) => handleChange(field, e.target.checked)} style={{ accentColor: "#c9a96e" }} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div style={sectionStyle}>
            <p style={{ ...labelStyle, marginBottom: "1rem", fontSize: "0.7rem" }}>SEO (Optional)</p>
            <div>
              <label style={labelStyle}>SEO Title</label>
              <input style={inputStyle} value={form.seo_title} onChange={(e) => handleChange("seo_title", e.target.value)} placeholder="Summerween Sale | Charmed & Dark" />
            </div>
            <div style={{ marginTop: "1rem" }}>
              <label style={labelStyle}>SEO Description</label>
              <input style={inputStyle} value={form.seo_description} onChange={(e) => handleChange("seo_description", e.target.value)} placeholder="Shop the Summerween sale..." />
            </div>
          </div>

          {error && <p role="alert" style={{ color: "#e55", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</p>}
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "0.75rem 2rem", fontSize: "0.8rem", fontWeight: 400, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "#000", backgroundColor: saving ? "#6b6760" : "#c9a96e",
              border: "none", cursor: saving ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", width: "100%",
            }}
          >
            {saving ? "Creating..." : "Create Promotion"}
          </button>
        </form>
      </div>
    </div>
  );
}
