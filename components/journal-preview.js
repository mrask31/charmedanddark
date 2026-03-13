import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function JournalPreview() {
  return (
    <section className="bg-black px-8 py-24 lg:px-16">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-[#B89C6D]">
          The Journal
        </span>
        <Link
          href="/journal"
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
        >
          <span>Read the Journal</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Featured Post */}
      <Link
        href="/journal"
        className="group grid grid-cols-1 gap-8 lg:grid-cols-2"
      >
        <div className="relative aspect-[16/10] overflow-hidden border border-transparent transition-colors duration-160 group-hover:border-[#B89C6D]">
          <Image
            src="/images/homepage/journal-preview.jpg"
            alt="Open grimoire with handwritten text and botanical illustrations"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-xs uppercase tracking-widest text-zinc-400">
            March 2026
          </span>
          <h3 className="mt-4 font-serif text-2xl text-white lg:text-3xl">
            Welcome to the Sanctuary: What Charmed & Dark Stands For
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            On building a brand that honors the beauty in darkness and the quiet
            rituals of everyday life.
          </p>
        </div>
      </Link>
    </section>
  );
}
