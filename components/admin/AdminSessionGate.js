"use client";

import { useState } from "react";

export default function AdminSessionGate({
  children,
  initialAuthenticated,
  configured,
  title = "Admin",
  description = "Enter the admin key to continue.",
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [secret, setSecret] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/promotions/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in.");
      }

      setSecret("");
      setAuthenticated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/promotions/session", { method: "DELETE" });
    setAuthenticated(false);
  }

  if (!configured) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#08080F", color: "#e8e4dc", fontFamily: "Inter, sans-serif", padding: "2rem", display: "grid", placeItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "520px", border: "1px solid rgba(239,68,68,0.25)", backgroundColor: "rgba(14,14,26,0.8)", padding: "2rem" }}>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.6rem", fontWeight: 400, margin: 0 }}>{title}</h1>
          <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "1rem" }}>Admin access is not configured.</p>
          <p style={{ color: "#a89a80", fontSize: "0.75rem", lineHeight: 1.6 }}>
            Set the server-only <code style={{ color: "#c9a96e" }}>PROMOTIONS_ADMIN_SECRET</code> environment variable, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#08080F", color: "#e8e4dc", fontFamily: "Inter, sans-serif", padding: "2rem", display: "grid", placeItems: "center" }}>
        <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: "420px", border: "1px solid rgba(201,169,110,0.2)", backgroundColor: "rgba(14,14,26,0.8)", padding: "2rem" }}>
          <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#c9a96e", margin: 0 }}>Charmed & Dark</p>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.7rem", fontWeight: 400, margin: "0.35rem 0 0.5rem" }}>{title}</h1>
          <p style={{ color: "#6b6760", fontSize: "0.75rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
            {description} Access is stored in a secure, HttpOnly session cookie and the key is never placed in the URL or browser bundle.
          </p>
          <label htmlFor="admin-session-secret" style={{ display: "block", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#a89a80", marginBottom: "0.4rem" }}>Admin key</label>
          <input
            id="admin-session-secret"
            type="password"
            autoComplete="current-password"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            required
            autoFocus
            style={{ width: "100%", boxSizing: "border-box", padding: "0.7rem 0.8rem", fontSize: "0.85rem", backgroundColor: "#08080F", border: "1px solid rgba(201,169,110,0.25)", color: "#e8e4dc", outline: "none" }}
          />
          {error && <p role="alert" style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.75rem" }}>{error}</p>}
          <button
            type="submit"
            disabled={submitting || !secret}
            style={{ width: "100%", marginTop: "1rem", padding: "0.7rem 1rem", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#08080F", backgroundColor: submitting || !secret ? "#6b6760" : "#c9a96e", border: 0, cursor: submitting || !secret ? "not-allowed" : "pointer" }}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div style={{ position: "fixed", top: "0.75rem", right: "0.75rem", zIndex: 50 }}>
        <button onClick={handleLogout} style={{ padding: "0.35rem 0.65rem", fontSize: "0.65rem", color: "#a89a80", backgroundColor: "rgba(8,8,15,0.9)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
          Sign out
        </button>
      </div>
      {children}
    </>
  );
}
