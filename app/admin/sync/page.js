"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SyncPanel() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [descLoading, setDescLoading] = useState(false);
  const [descResult, setDescResult] = useState(null);
  const [descError, setDescError] = useState(null);

  if (key !== "charmed-dark-admin") return null;

  async function handleSync() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/sync-products", {
        method: "POST",
        headers: {
          Authorization: "Bearer charmed-dark-sync-2026",
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDescriptions() {
    setDescLoading(true);
    setDescResult(null);
    setDescError(null);

    try {
      const res = await fetch("/api/admin/generate-descriptions", {
        method: "POST",
        headers: {
          Authorization: "Bearer charmed-dark-sync-2026",
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setDescResult(data);
    } catch (err) {
      setDescError(err.message);
    } finally {
      setDescLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080F",
        color: "#e8e4dc",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontFamily: "Cormorant Garamond, Georgia, serif",
          fontSize: "2rem",
          fontWeight: 400,
          marginBottom: "0.5rem",
        }}
      >
        Charmed & Dark
      </h1>
      <p
        style={{
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#c9a96e",
          marginBottom: "2.5rem",
        }}
      >
        Product Sync
      </p>

      <button
        onClick={handleSync}
        disabled={loading}
        style={{
          padding: "0.75rem 2rem",
          fontSize: "0.8rem",
          fontWeight: 300,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: loading ? "#6b6760" : "#c9a96e",
          backgroundColor: "transparent",
          border: `1px solid ${loading ? "#3a3a3a" : "#c9a96e"}`,
          borderRadius: 0,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "Inter, sans-serif",
          transition: "all 0.2s",
        }}
      >
        {loading ? "Syncing..." : "Sync Products from Shopify"}
      </button>

      {result && (
        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.85rem" }}>
          <p style={{ color: "#c9a96e", marginBottom: "0.5rem" }}>Sync Complete</p>
          <p>Products synced: {result.products_synced}</p>
          <p>Variants synced: {result.variants_synced}</p>
          <p>Skipped: {result.products_skipped}</p>
          <p style={{ color: "#6b6760" }}>Duration: {result.duration_ms}ms</p>
          {result.errors?.length > 0 && (
            <div style={{ marginTop: "1rem", color: "#e55" }}>
              <p>Errors ({result.errors.length}):</p>
              {result.errors.map((e, i) => (
                <p key={i} style={{ fontSize: "0.75rem" }}>
                  {e.product}: {e.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ marginTop: "1.5rem", color: "#e55", fontSize: "0.85rem" }}>
          {error}
        </p>
      )}

      {/* Divider */}
      <div style={{ width: '200px', height: '1px', backgroundColor: 'rgba(201,169,110,0.2)', margin: '2.5rem 0' }} />

      {/* AI Description Generator */}
      <button
        onClick={handleDescriptions}
        disabled={descLoading || loading}
        style={{
          padding: "0.75rem 2rem",
          fontSize: "0.8rem",
          fontWeight: 300,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: descLoading ? "#6b6760" : "#c9a96e",
          backgroundColor: "transparent",
          border: `1px solid ${descLoading ? "#3a3a3a" : "#c9a96e"}`,
          borderRadius: 0,
          cursor: descLoading ? "not-allowed" : "pointer",
          fontFamily: "Inter, sans-serif",
          transition: "all 0.2s",
        }}
      >
        {descLoading ? "Generating descriptions... This may take 2-3 minutes." : "Generate Descriptions with AI"}
      </button>

      {descResult && (
        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.85rem" }}>
          <p style={{ color: "#c9a96e", marginBottom: "0.5rem" }}>Descriptions Complete</p>
          <p>Generated: {descResult.generated}</p>
          <p>Skipped: {descResult.skipped} (already had descriptions)</p>
          <p style={{ color: "#6b6760" }}>Duration: {descResult.duration_ms}ms</p>
          {descResult.errors?.length > 0 && (
            <div style={{ marginTop: "1rem", color: "#e55" }}>
              <p>Errors ({descResult.errors.length}):</p>
              {descResult.errors.map((e, i) => (
                <p key={i} style={{ fontSize: "0.75rem" }}>
                  {e.product || 'Unknown'}: {e.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {descError && (
        <p style={{ marginTop: "1.5rem", color: "#e55", fontSize: "0.85rem" }}>
          {descError}
        </p>
      )}
    </div>
  );
}

export default function AdminSyncPage() {
  return (
    <Suspense fallback={null}>
      <SyncPanel />
    </Suspense>
  );
}
