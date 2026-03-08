"use client";

import Link from "next/link";
import { Flame, Lock, Moon, Rose, Star } from "lucide-react";

const isMemberDemo = false;

const resonanceItems = [
  { label: "Candle", count: 12, Icon: Flame },
  { label: "Rose", count: 7, Icon: Rose },
  { label: "Moon", count: 4, Icon: Moon },
  { label: "Star", count: 9, Icon: Star },
];

const TileBadge = ({ children, className = "" }) => (
  <span
    className={`badge rounded-full bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.35em] ${className}`}
  >
    {children}
  </span>
);

const ResonanceIcon = ({ Icon }) => (
  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80">
    <Icon className="h-4 w-4" aria-hidden="true" />
  </span>
);

export default function Sanctuary() {
  const mirrorCta = isMemberDemo
    ? { label: "Enter The Mirror", href: "/#mirror" }
    : { label: "Reveal a Reading (Preview)", href: "/#mirror" };
  const grimoireCta = isMemberDemo
    ? { label: "Open Grimoire", href: "/sanctuary/grimoire" }
    : { label: "Join to Unlock", href: "/join" };
  const priceCta = isMemberDemo
    ? { label: "Shop with Sanctuary Price", href: "/shop" }
    : { label: "Join to Unlock", href: "/join" };

  return (
    <section className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-black/40 to-black/80" />
        <div className="relative space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            NO FEEDS. NO FOLLOWERS. NO PERFORMANCE.
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              The Sanctuary
            </h1>
            <p className="text-base text-white/80">
              A private realm designed for daily return — quiet by design.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="tile-mirror rounded-2xl bg-white/10 p-5 backdrop-blur-md">
          <div className="relative flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">The Mirror</h2>
              <p className="text-sm text-white/85">
                A private reflection and recommendation—quiet, personal,
                on-brand.
              </p>
            </div>
            {!isMemberDemo ? (
              <TileBadge className="badge--preview">Preview</TileBadge>
            ) : null}
          </div>
          <Link
            href={mirrorCta.href}
            className="btn-primary relative mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium sm:w-auto"
          >
            {mirrorCta.label}
          </Link>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-[0_20px_55px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">Grimoire</h2>
              <p
                className={`text-sm text-white/80 ${
                  isMemberDemo ? "" : "blur-[2px]"
                }`}
              >
                Your saved readings—private, timestamped, and always yours.
              </p>
            </div>
            {!isMemberDemo ? (
              <TileBadge className="badge--locked">Locked</TileBadge>
            ) : null}
          </div>
          <Link
            href={grimoireCta.href}
            className="btn-secondary mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium sm:w-auto"
          >
            {grimoireCta.label}
          </Link>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-[0_20px_55px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                Sanctuary Price
              </h2>
              <p
                className={`text-sm text-white/80 ${
                  isMemberDemo ? "" : "blur-[2px]"
                }`}
              >
                10% off always—shown on every item.
              </p>
            </div>
            {!isMemberDemo ? (
              <TileBadge className="badge--locked">Locked</TileBadge>
            ) : null}
          </div>
          <Link
            href={priceCta.href}
            className="btn-secondary mt-5 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium sm:w-auto"
          >
            {priceCta.label}
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm uppercase tracking-[0.35em] text-white/60">
              Resonance
            </h3>
            <p className="text-sm text-white/70">
              Sometimes members leave a trace—never names, never noise.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {resonanceItems.map(({ label, count, Icon }) => (
              <div
                key={label}
                className="resonance-pill flex items-center gap-2 rounded-full px-3 py-2 text-xs uppercase tracking-[0.28em]"
              >
                <ResonanceIcon Icon={Icon} />
                <span>{label}</span>
                <span className="text-white/60">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">
            Recent in your Grimoire
          </h3>
          {!isMemberDemo ? (
            <TileBadge className="badge--locked">Locked</TileBadge>
          ) : null}
        </div>
        {isMemberDemo ? (
          <div className="mt-4 space-y-3 text-sm text-white/70">
            {[
              "Reading • 01 Confess",
              "Reading • 02 Receive",
              "Reading • 03 Keep",
            ].map((entry) => (
              <div
                key={entry}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
              >
                <span>{entry}</span>
                <span className="text-xs uppercase tracking-[0.25em] text-white/50">
                  07.22.25
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-white/70">
              Your Grimoire appears when you join.
            </p>
            <div className="space-y-3">
              {[
                {
                  title: "Reading Card #001",
                  detail: "Silence is rising tonight.",
                },
                {
                  title: "Reading Card #002",
                  detail: "Softness is not surrender.",
                },
                {
                  title: "Reading Card #003",
                  detail: "You don't need to be bright to be seen.",
                },
              ].map((row) => (
                <div
                  key={row.title}
                  className="grimoire-ghost flex items-center justify-between rounded-2xl px-4 py-3"
                >
                  <div className="grimoire-ghost__text space-y-1">
                    <p className="text-sm font-medium">{row.title}</p>
                    <p className="text-xs">{row.detail}</p>
                  </div>
                  <Lock className="h-4 w-4 text-white/40" aria-hidden="true" />
                </div>
              ))}
            </div>
            <Link
              href="/join"
              className="btn-primary inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium sm:w-auto"
            >
              Join Free
            </Link>
          </div>
        )}
      </section>
    </section>
  );
}
