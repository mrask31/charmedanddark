"use client";

import { useState } from "react";

export default function JoinForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    console.log("Sanctuary signup:", email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
        EMAIL
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@darkhouse.com"
          className="w-full rounded-full border border-white/15 bg-black px-5 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          required
        />
      </label>
      <p className="text-xs text-white/50">
        No spam. No noise. Only drops + quiet signals.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="btn-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium"
        >
          Enter the Sanctuary
        </button>
        <a
          href="#member-benefits"
          className="btn-secondary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium"
        >
          See member benefits
        </a>
      </div>
      <p className="text-xs text-white/60">
        Free to join. Purchases are separate.
      </p>
      {submitted ? (
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          You're in. Check your email soon.
        </p>
      ) : null}
    </form>
  );
}
