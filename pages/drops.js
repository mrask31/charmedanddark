import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const pulseWindows = [
  {
    title: "Day",
    detail: "Soft light, open ritual, slow invitations.",
  },
  {
    title: "Evening",
    detail: "Quiet escalation, curated silhouettes, calm pulse.",
  },
  {
    title: "Midnight",
    detail: "Private access, shadowed objects, the room stills.",
  },
];

const archiveTiles = ["Obsidian Archive", "Eclipse Vault", "Nocturne Shelf"];

export default function Drops() {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleAlertsSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    console.log("Drop alerts signup:", email);
  };

  return (
    <>
      <Head>
        <title>Drops | Charmed & Dark</title>
        <meta
          name="description"
          content="Limited gothic home décor drops released in quiet windows. Join the Sanctuary for early access and Sanctuary pricing."
        />
        <meta property="og:title" content="Drops | Charmed & Dark" />
        <meta
          property="og:description"
          content="Limited gothic home décor drops released in quiet windows. Join the Sanctuary for early access and Sanctuary pricing."
        />
        <meta name="twitter:title" content="Drops | Charmed & Dark" />
        <meta
          name="twitter:description"
          content="Limited gothic home décor drops released in quiet windows. Join the Sanctuary for early access and Sanctuary pricing."
        />
      </Head>

      <section className="space-y-12">
        <section className="space-y-5">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            DROPS
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Limited releases. Quiet power.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-white/70">
            Small runs of gothic home décor and ritual objects—released in
            windows, then gone.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Join the Sanctuary
            </Link>
            <button
              type="button"
              onClick={() => setIsAlertsOpen(true)}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Get drop alerts
            </button>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Members unlock Sanctuary pricing and early access.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Next Drop: Coming Soon</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/70">
              When the window opens, the Threshold shifts. Join to be notified
              first.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Preview Window", value: "TBA" },
                { label: "Release Window", value: "TBA" },
                { label: "Sanctuary Early Access", value: "TBA" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-black/60 p-4 text-center"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm text-white/80">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">How Drops Work</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Limited run",
                body: "Once it closes, it doesn’t return the same.",
              },
              {
                title: "Timed windows",
                body: "Released in Day / Evening / Midnight windows.",
              },
              {
                title: "Member access",
                body: "Sanctuary members see it first and pay less.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-base font-medium">{card.title}</h3>
                <p className="mt-2 text-sm text-white/70">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Pulse Windows</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {pulseWindows.map((window) => (
              <div
                key={window.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {window.title}
                </p>
                <p className="mt-2 text-sm text-white/70">{window.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            Echo Cards reset each window. The room stays quiet—never crowded.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Archive (Locked)</h2>
          <p className="text-sm text-white/70">
            Past drops, preserved in the dark. Join to unlock the archive.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archiveTiles.map((title) => (
              <div
                key={title}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                <p className="relative text-xs uppercase tracking-[0.3em] text-white/50">
                  {title}
                </p>
                <div className="relative mt-4 h-28 rounded-xl border border-white/10 bg-black/60" />
              </div>
            ))}
          </div>
          <Link
            href="/join"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Unlock the Archive
          </Link>
        </section>
      </section>

      {isAlertsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close alerts"
            onClick={() => setIsAlertsOpen(false)}
            className="absolute inset-0"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-black p-6 text-white">
            <h3 className="text-lg font-medium">Get drop alerts</h3>
            <p className="mt-2 text-sm text-white/70">
              Be the first to know when the window opens.
            </p>
            <form onSubmit={handleAlertsSubmit} className="mt-4 space-y-3">
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@darkhouse.com"
                  className="rounded-full border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  required
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Notify Me
              </button>
              <p className="text-xs text-white/50">No spam. Only drops.</p>
              {submitted ? (
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  You are on the list.
                </p>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
