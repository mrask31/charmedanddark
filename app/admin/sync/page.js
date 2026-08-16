"use client";

import { useState } from "react";

export default function AdminSyncPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [descLoading, setDescLoading] = useState(false);
  const [descResult, setDescResult] = useState(null);
  const [descError, setDescError] = useState(null);
  const [forceLoading, setForceLoading] = useState(false);
  const [forceResult, setForceResult] = useState(null);
  const [forceError, setForceError] = useState(null);

  async function runAdminAction(url, errorMessage) {
    const res = await fetch(url, { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || errorMessage);
    return data;
  }

  async function handleSync() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      setResult(await runAdminAction("/api/admin/sync-products", "Sync failed"));
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
      setDescResult(await runAdminAction("/api/admin/generate-descriptions", "Generation failed"));
    } catch (err) {
      setDescError(err.message);
    } finally {
      setDescLoading(false);
    }
  }

  async function handleForceRegenerate() {
    setForceLoading(true);
    setForceResult(null);
    setForceError(null);

    try {
      setForceResult(await runAdminAction("/api/admin/generate-descriptions?force=true", "Force generation failed"));
    } catch (err) {
      setForceError(err.message);
    } finally {
      setForceLoading(false);
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
        Commerce Admin
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
              {result.errors.map((entry, index) => (
                <p key={index} style={{ fontSize: "0.75rem" }}>
                  {entry.product}: {entry.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p role="alert" style={{ marginTop: "1.5rem", color: "#e55", fontSize: "0.85rem" }}>
          {error}
        </p>
      )}

      <div style={{ width: "200px", height: "1px", backgroundColor: "rgba(201,169,110,0.2)", margin: "2.5rem 0" }} />

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
        {descLoading ? "Generating descriptions... This may take a few minutes." : "Generate Descriptions with AI"}
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
              {descResult.errors.map((entry, index) => (
                <p key={index} style={{ fontSize: "0.75rem" }}>
                  {entry.product || "Unknown"}: {entry.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {descError && (
        <p role="alert" style={{ marginTop: "1.5rem", color: "#e55", fontSize: "0.85rem" }}>
          {descError}
        </p>
      )}

      <div style={{ width: "200px", height: "1px", backgroundColor: "rgba(232,228,220,0.1)", margin: "2.5rem 0" }} />

      <button
        onClick={handleForceRegenerate}
        disabled={forceLoading || descLoading || loading}
        style={{
          padding: "0.6rem 1.5rem",
          fontSize: "0.7rem",
          fontWeight: 300,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: forceLoading ? "#6b6760" : "rgba(232,228,220,0.5)",
          backgroundColor: "transparent",
          border: `1px solid ${forceLoading ? "#3a3a3a" : "rgba(232,228,220,0.2)"}`,
          borderRadius: 0,
          cursor: forceLoading ? "not-allowed" : "pointer",
          fontFamily: "Inter, sans-serif",
          transition: "all 0.2s",
        }}
      >
        {forceLoading ? "Regenerating all descriptions..." : "Force Regenerate ALL Descriptions"}
      </button>
      <p style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: "rgba(232,228,220,0.3)" }}>
        Warning: overwrites all descriptions. Use only when intentionally replacing the catalog copy.
      </p>

      {forceResult && (
        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.85rem" }}>
          <p style={{ color: "#c9a96e", marginBottom: "0.5rem" }}>Force Regeneration Complete</p>
          <p>Generated: {forceResult.generated}</p>
          <p>Skipped: {forceResult.skipped}</p>
          <p style={{ color: "#6b6760" }}>Duration: {forceResult.duration_ms}ms</p>
          {forceResult.errors?.length > 0 && (
            <div style={{ marginTop: "1rem", color: "#e55" }}>
              <p>Errors ({forceResult.errors.length}):</p>
              {forceResult.errors.map((entry, index) => (
                <p key={index} style={{ fontSize: "0.75rem" }}>
                  {entry.product || "Unknown"}: {entry.error}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {forceError && (
        <p role="alert" style={{ marginTop: "1.5rem", color: "#e55", fontSize: "0.85rem" }}>
          {forceError}
        </p>
      )}
    </div>
  );
}
