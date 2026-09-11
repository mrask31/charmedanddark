import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { getMerchandisingProducts } from '@/lib/catalog-merchandising';
import { productIsAvailable } from '@/lib/product-display';
import CollectionGrid from '@/components/shop/CollectionGrid';
import SmuttyGoodGirlDrop from '@/components/drops/SmuttyGoodGirlDrop';
import DropAlertBand from '@/components/drops/DropAlertBand';
import { Footer } from '@/components/footer';

export const revalidate = 60;
export const metadata = {
  title: 'New & Upcoming Gothic Drops',
  description: 'Discover new Charmed & Dark releases, preview the upcoming fall attire, and sign up for seasonal collection announcements.',
  alternates: { canonical: 'https://www.charmedanddark.com/drops' },
};

export default async function DropsPage() {
  const [products, smuttyGoodGirl] = await Promise.all([getProducts(), getMerchandisingProducts('smutty-good-girl')]);
  // Only products published to this storefront can reach this list. Drafts stay private.
  const fall = products.filter((p) => !p.hidden && productIsAvailable(p) &&
    p.tags?.some((tag) => ['fall 2026', 'collection:fall-2026'].includes(tag.toLowerCase())));
  return <><main className="bg-[#08080f] pb-16">
    <section className="mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-12">
      <p className="text-xs uppercase tracking-[0.3em] text-[#c9a96e]">Drops</p>
      <h1 className="mt-5 font-serif text-5xl text-[#f5f0e8] sm:text-6xl">New arrivals. The next chapter.</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-zinc-300">Discover what has just arrived, take a first look at upcoming collections, and find out which designs are taking their final bow.</p>
      <nav aria-label="Explore drops" className="mt-8 flex flex-wrap gap-4 text-sm">
        <a href="#just-dropped" className="border border-[#c9a96e] px-5 py-3 text-[#c9a96e]">Shop new releases</a>
        <a href="#coming-soon" className="border border-zinc-600 px-5 py-3">Coming soon</a>
        <Link href="/last-chance" className="px-5 py-3 text-[#c9a96e] underline">Last Chance</Link>
      </nav>
    </section>
    <section id="coming-soon" className="scroll-mt-28 border-y border-[#c9a96e]/30 bg-[#17121a] px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-widest text-[#c9a96e]">Coming soon</p>
        <h2 className="mt-4 font-serif text-4xl">Fall is gathering.</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300">Our next collection of fall attire is on its way. Get the announcement when new designs arrive.</p>
        <a href="#drop-alerts" className="mt-6 inline-block border border-[#c9a96e] px-6 py-3 text-sm text-[#c9a96e]">Get drop announcements</a>
      </div>
    </section>
    <section id="just-dropped" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-12 lg:px-12">
      <h2 className="font-serif text-4xl">Just Dropped</h2>
      {fall.length > 0 && <section className="mt-8" aria-labelledby="fall-first-look"><h3 id="fall-first-look" className="font-serif text-2xl">A first look at fall</h3><p className="mt-3 text-zinc-300">Available to order now, with more designs to come.</p><CollectionGrid products={fall} /></section>}
      <div className="mt-12"><SmuttyGoodGirlDrop products={smuttyGoodGirl} /></div>
    </section>
    <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-12">
      <h2 className="font-serif text-3xl">Summerween’s Final Haunt</h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300">This season’s designs are preparing to leave. Summerween returns next summer with new designs.</p>
      <Link href="/last-chance" className="mt-5 inline-block py-3 text-[#c9a96e] underline">Explore Last Chance</Link>
    </section>
    <DropAlertBand />
  </main><Footer /></>;
}
