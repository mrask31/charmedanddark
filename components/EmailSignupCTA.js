"use client";

import { useState } from "react";

export default function EmailSignupCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate email contains @ symbol
    if (!email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          source: "journal",
          consent: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.alreadySubscribed) {
          setStatus("success");
          setMessage("Thanks for signing up. Check your inbox for any confirmation email.");
        } else {
          setStatus("success");
          setMessage("Thanks for signing up. Check your inbox for any confirmation email.");
          setEmail("");
        }
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-black border border-white/10 p-8">
      <h3 className="font-serif text-2xl uppercase tracking-widest mb-4">
        Keep your next chapter close
      </h3>
      <p className="text-zinc-400 mb-6">
        Get gothic styling guides, bookish gift ideas, and new-drop alerts from Charmed & Dark.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          aria-label="Email address for the Charmed & Dark newsletter"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status === "loading" || status === "success"}
          className="w-full bg-zinc-950 border border-white/10 px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#B89C6D] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: "0px" }}
          required
        />

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-full bg-[#B89C6D] text-black px-6 py-3 font-medium uppercase tracking-wider hover:bg-[#A68B5D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: "0px" }}
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>

        {message && (
          <p
            className={`text-sm ${
              status === "success" ? "text-[#B89C6D]" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
        <p className="text-xs leading-relaxed text-zinc-400">By subscribing, you agree to receive marketing emails. Unsubscribe anytime. No account needed.</p>
        <p className="text-sm text-zinc-300">For 10% member savings, <a href="/join" className="text-[#B89C6D] underline">join the free Sanctuary</a> separately and sign in when shopping.</p>
      </form>
    </div>
  );
}
