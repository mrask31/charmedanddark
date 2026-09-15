import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { getMerchandisingProducts } from '@/lib/catalog-merchandising';
import { availableFallProducts, summerweenSeason } from '@/lib/seasonal-collections';
import CollectionGrid from '@/components/shop/CollectionGrid';
import SmuttyGoodGirlDrop from '@/components/drops/SmuttyGoodGirlDrop';
import DropAlertBand from '@/components/drops/DropAlertBand';
import { Footer } from '@/components/footer';

export const revalidate = 60;
export const metadata = {
  title: 'New & Upcoming Gothic Drops',
  description: 'Discover the Fall collection, new Charmed & Dark releases, seasonal farewells, and announcements for the next designs.',
  alternates: { canonical: 'https://www.charmedanddark.com/drops' },
};

export default async function DropsPage() {
  const [products, smuttyGoodGirl] = await Promise.all([getProducts(), getMerchandisingProducts('smutty-good-girl')]);
  // Only products published to this storefront can reach this list. Drafts stay private.
  const fall = availableFallProducts(products);
  const { retired } = summerweenSeason(products);
  return <><main className="bg-[#08080f] pb-16">
    <section className="mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-12">
      <p className="text-xs uppercase tracking-[0.3em] text-[#c9a96e]">Drops</p>
      <h1 className="mt-5 font-serif text-5xl text-[#f5f0e8] sm:text-6xl">New arrivals. The next chapter.</h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-zinc-300">Discover what has just arrived, take a first look at upcoming collections, and find out which designs are taking their final bow.</p>
      <nav aria-label="Explore drops" className="mt-8 flex flex-wrap gap-4 text-sm">
        <a href="#just-dropped" className="border border-[#c9a96e] px-5 py-3 text-[#c9a96e]">Shop new releases</a>
        <a href="#coming-soon" className="border border-zinc-600 px-5 py-3">The Fall Collection</a>
        <Link href="/last-chance" className="px-5 py-3 text-[#c9a96e] underline">Last Chance</Link>
        <Link href="/deceased" className="px-5 py-3 text-[#c9a96e] underline">Deceased</Link>
      </nav>
    </section>
    <section id="coming-soon" className="scroll-mt-28 border-y border-[#c9a96e]/30 bg-[#17121a] px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-widest text-[#c9a96e]">{fall.length ? 'Available now' : 'The next chapter'}</p>
        <h2 className="mt-4 font-serif text-4xl">{fall.length ? 'Fall has arrived. More is stirring.' : 'Fall is gathering.'}</h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300">{fall.length ? 'Longer nights. Darker layers. The first Fall pieces are here, with more designs to come.' : 'Get the announcement when the next Fall designs arrive.'}</p>
        <div className="mt-6 flex flex-wrap gap-4">
          {fall.length > 0 && <Link href="/collections/fall-2026" className="inline-block border border-[#c9a96e] px-6 py-3 text-sm text-[#c9a96e]">Shop the Fall Collection</Link>}
          <a href="#drop-alerts" className="inline-block px-2 py-3 text-sm text-[#c9a96e] underline">Get drop announcements</a>
        </div>
      </div>
    </section>
    <section id="just-dropped" className="mx-auto max-w-7xl scroll-mt-28 px-6 py-12 lg:px-12">
      <h2 className="font-serif text-4xl">Just Dropped</h2>
      {fall.length > 0 && <section className="mt-8" aria-labelledby="fall-first-look"><h3 id="fall-first-look" className="font-serif text-2xl">A first look at fall</h3><p className="mt-3 text-zinc-300">Available to order now, with more designs to come.</p><CollectionGrid products={fall} /></section>}
      <div className="mt-12"><SmuttyGoodGirlDrop products={smuttyGoodGirl} /></div>
    </section>
    <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-12">
      <h2 className="font-serif text-3xl">{retired ? 'Summerween is gone. The spirit remains.' : 'Summerween’s Final Haunt'}</h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-zinc-300">{retired ? 'This chapter has been laid to rest. Summerween returns next summer with an entirely new collection. New designs. Familiar spirits.' : 'This season’s designs are taking their final bow. Summerween returns next summer with all-new designs.'}</p>
      <div className="mt-5 flex flex-wrap gap-6">
        {!retired && <Link href="/last-chance" className="inline-block py-3 text-[#c9a96e] underline">Explore Last Chance</Link>}
        <Link href="/deceased" className="inline-block py-3 text-[#c9a96e] underline">Visit Deceased — the collection archive</Link>
      </div>
    </section>
    <DropAlertBand />
  </main><Footer /></>;
}
