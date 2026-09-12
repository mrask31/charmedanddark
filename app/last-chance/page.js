import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { lastChanceProducts } from '@/lib/discovery';
import CollectionGrid from '@/components/shop/CollectionGrid';
import { Footer } from '@/components/footer';

export const revalidate = 60;
export const metadata = { title: 'Last Chance — Retiring Designs', description: 'Discover retiring designs and seasonal farewells at Charmed & Dark. Shop the Summerween collection before this season closes.', alternates: { canonical: 'https://www.charmedanddark.com/last-chance' } };
export default async function LastChancePage() {
  const products = lastChanceProducts(await getProducts());
  return <><main className="mx-auto max-w-7xl px-6 pb-24 pt-12 lg:px-12">
    <p className="text-xs uppercase tracking-widest text-[#c9a96e]">The final chapter</p>
    <h1 className="mt-4 font-serif text-5xl text-[#f5f0e8]">Last Chance</h1>
    <p className="mt-5 max-w-2xl leading-relaxed text-zinc-300">A farewell to designs leaving the shop. Find a favorite before its chapter closes.</p>
    <section className="mt-8 border border-[#c9a96e]/40 bg-[#17131b] p-6" aria-labelledby="summerween-farewell">
      <h2 id="summerween-farewell" className="font-serif text-3xl">Summerween’s Final Haunt</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">Summerween returns next summer with new designs. This season’s items are made to order and will retire when the ordering window closes.</p>
      <Link href="/collections/summerween" className="mt-4 inline-block py-2 text-sm text-[#c9a96e] underline">Explore Summerween</Link>
    </section>
    {products.length ? <CollectionGrid products={products} /> : <p className="my-12 text-zinc-300">There are no retiring items available to order right now. <Link href="/drops" className="underline">See what is coming next</Link>.</p>}
  </main><Footer /></>;
}
