"use client";

import Link from "next/link";

export function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/homepage/hero-background.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 lg:px-16">
          <div className="font-serif text-xl uppercase tracking-[0.3em] text-white">
            Charmed & Dark
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
            >
              Shop
            </Link>
            <Link
              href="/drops"
              className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
            >
              Drops
            </Link>
            <Link
              href="/journal"
              className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
            >
              Journal
            </Link>
            <Link
              href="/about"
              className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
            >
              About
            </Link>
            <Link
              href="/join"
              className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
            >
              Join
            </Link>
            <Link
              href="#"
              className="text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
            >
              Cart
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <h1 className="max-w-4xl font-serif text-3xl italic leading-tight text-white md:text-5xl lg:text-6xl">
            Elegant gothic goods for the life you actually live.
          </h1>

          {/* CTAs */}
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/shop"
              className="border border-white px-8 py-4 text-xs uppercase tracking-widest text-white transition-colors duration-160 hover:bg-white hover:text-black"
            >
              Shop the Threshold
            </Link>
            <Link
              href="/sanctuary"
              className="bg-[#B89C6D] px-8 py-4 text-xs uppercase tracking-widest text-black transition-opacity duration-160 hover:opacity-90"
            >
              Enter the Sanctuary
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
