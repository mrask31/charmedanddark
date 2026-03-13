import Link from 'next/link';
import Image from 'next/image';

export default function JournalPreview() {
  return (
    <section className="py-24 px-6 bg-black">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <span className="text-xs font-sans uppercase tracking-widest text-gold mb-12 block">
          The Journal
        </span>

        {/* Featured Post */}
        <Link href="/journal/finding-comfort-in-darkness" className="group grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden border border-transparent group-hover:border-gold transition-colors duration-160">
            <Image
              src="/images/Candle with Ethos 2.png"
              alt="Finding Comfort in Darkness"
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center">
            <span className="text-xs text-zinc-600 uppercase tracking-widest mb-4">
              March 2026
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-white mb-4 leading-tight">
              Finding Comfort in Darkness
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              On building a home that feels like refuge, not performance.
            </p>
          </div>
        </Link>

        {/* Read More Link */}
        <div className="mt-12 text-right">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-zinc-400 hover:text-white transition-colors duration-160"
          >
            Read the Journal
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="square" strokeLinejoin="miter" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
