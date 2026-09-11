import Link from 'next/link';
import { SHOP_COLLECTIONS, THEME_COLLECTIONS } from '@/lib/discovery';

export default function ShopDestinations() {
  return <section className="border-y border-zinc-800 bg-[#0d0d14] px-6 py-10 lg:px-16" aria-labelledby="shop-by-category">
    <div className="mx-auto max-w-7xl">
      <h2 id="shop-by-category" className="font-serif text-3xl text-[#f5f0e8]">Find your kind of darkness</h2>
      <nav aria-label="Shop by category" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SHOP_COLLECTIONS.map((c) => <Link key={c.handle} href={`/collections/${c.handle}`} className="flex min-h-16 items-center border border-zinc-700 px-4 py-4 text-sm text-[#e8e4dc] hover:border-[#c9a96e] hover:text-[#c9a96e] focus-visible:outline-2 focus-visible:outline-[#c9a96e]">{c.label}<span aria-hidden="true" className="ml-auto pl-2">→</span></Link>)}
      </nav>
      <nav aria-label="Seasonal and themed collections" className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#c9a96e]">
        {THEME_COLLECTIONS.map((c) => <Link key={c.handle} href={`/collections/${c.handle}`} className="py-2 underline underline-offset-4">{c.label}</Link>)}
        <Link href="/drops" className="py-2 underline underline-offset-4">New & Upcoming Drops</Link>
        <Link href="/last-chance" className="py-2 underline underline-offset-4">Last Chance</Link>
      </nav>
    </div>
  </section>;
}
