import Link from 'next/link';
import { SHOP_COLLECTIONS, THEME_COLLECTIONS } from '@/lib/discovery';

export default function ShopDestinations() {
  const primary = SHOP_COLLECTIONS.slice(0, 5);
  const secondary = SHOP_COLLECTIONS.slice(5);
  return <section className="border-y border-white/10 bg-[#0d0d12] px-5 py-7 sm:px-8 lg:px-10" aria-label="Explore the shop">
    <div className="mx-auto max-w-7xl">
      <nav aria-label="Shop by category" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {primary.map((collection) => <Link key={collection.handle} href={`/collections/${collection.handle}`} className="flex min-h-12 items-center justify-between gap-3 border border-white/15 px-4 py-3 text-sm text-[#f5f0e8] transition-colors hover:border-[#c9a96e] hover:text-[#d4b984] focus-visible:outline-2 focus-visible:outline-[#c9a96e]">{collection.label}<span aria-hidden="true">→</span></Link>)}
      </nav>
      <nav aria-label="Collections and more to explore" className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        {THEME_COLLECTIONS.map((collection) => <Link key={collection.handle} href={`/collections/${collection.handle}`} className="inline-flex min-h-11 items-center text-[#d4b984] underline underline-offset-4">{collection.label}</Link>)}
        {secondary.map((collection) => <Link key={collection.handle} href={`/collections/${collection.handle}`} className="inline-flex min-h-11 items-center text-zinc-300 underline underline-offset-4">{collection.handle === 'accessories' ? 'Jewelry & Hats' : collection.label}</Link>)}
        <Link href="/drops" className="inline-flex min-h-11 items-center text-zinc-300 underline underline-offset-4">New & Upcoming</Link>
        <Link href="/last-chance" className="inline-flex min-h-11 items-center text-zinc-300 underline underline-offset-4">Last Chance</Link>
      </nav>
    </div>
  </section>;
}
