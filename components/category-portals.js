"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CategoryPortals() {
  return (
    <section className="mt-12 grid min-h-[500px] grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-4">
      {/* The Wardrobe */}
      <Link
        href="/shop"
        className="group relative flex min-h-[500px] flex-col justify-end overflow-hidden bg-zinc-950 p-8 lg:p-12"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url('/images/homepage/wardrobe-portal.png')`,
          }}
        >
          <div className="absolute inset-0 bg-black/50 transition-colors duration-160 group-hover:bg-black/40" />
        </div>

        {/* Gold border on hover */}
        <div className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-160 group-hover:border-[#B89C6D]" />

        <div className="relative z-10">
          <span className="text-xs uppercase tracking-widest text-zinc-400">
            Collection
          </span>
          <h2 className="mt-2 font-serif text-3xl uppercase tracking-tight text-white lg:text-4xl">
            The Wardrobe
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Dark fashion for every dimension.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-widest text-white">
            <span>Explore</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-160 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>

      {/* The Ritual */}
      <Link
        href="/shop"
        className="group relative flex min-h-[500px] flex-col justify-end overflow-hidden bg-zinc-950 p-8 lg:p-12"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url('/images/homepage/ritual-portal.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/50 transition-colors duration-160 group-hover:bg-black/40" />
        </div>

        {/* Gold border on hover */}
        <div className="pointer-events-none absolute inset-0 border border-transparent transition-colors duration-160 group-hover:border-[#B89C6D]" />

        <div className="relative z-10">
          <span className="text-xs uppercase tracking-widest text-zinc-400">
            Collection
          </span>
          <h2 className="mt-2 font-serif text-3xl uppercase tracking-tight text-white lg:text-4xl">
            The Ritual
          </h2>
          <p className="mt-3 text-sm text-zinc-400">
            Objects for home and altar.
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-widest text-white">
            <span>Explore</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-160 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </section>
  );
}
