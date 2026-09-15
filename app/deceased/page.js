import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { summerweenSeason, SUMMERWEEN_MEMORY } from '@/lib/seasonal-collections';
import { isSummerweenSurvivor } from '@/lib/product-lifecycle';
import DropAlertBand from '@/components/drops/DropAlertBand';
import { Footer } from '@/components/footer';

export const revalidate = 60;
export const metadata = {
  title: 'Deceased — The Summerween Collection Archive',
  description: 'Gone for the season. Never forgotten. Remember Summerween at Charmed & Dark and follow its return next summer with all-new designs.',
  alternates: { canonical: 'https://www.charmedanddark.com/deceased' },
};

export default async function DeceasedPage() {
  const catalog = await getProducts();
  const { retired, remaining } = summerweenSeason(catalog);
  const survivor = catalog.find((product) => !product.hidden && isSummerweenSurvivor(product));
  return <><main className="bg-[#0c0b0f] text-[#f5f0e8]">
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#d4b984]">The collection archive</p>
        <h1 className="mt-4 font-serif text-6xl italic sm:text-7xl">Deceased</h1>
        <div className="my-7 h-px w-20 bg-[#c9a96e]/60" />
        <p className="text-xs uppercase tracking-[0.2em] text-[#bcb2a7]">Summerween · 2026{!retired && ' · The final farewell'}</p>
        <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">{retired ? <>Summerween is gone.<br />The spirit remains.</> : <>Summerween takes its final bow.<br />The spirit remains.</>}</h2>
        <p className="mt-5 max-w-lg leading-relaxed text-[#c4bdb3]">{retired ? 'This chapter of Summerween has been laid to rest. Thank you for spending your haunted summer with us.' : `We’re saying farewell to this chapter of Summerween. ${remaining.length === 1 ? 'A final design is' : 'The final designs are'} still available before the collection is laid to rest.`}</p>
        <p className="mt-4 max-w-lg leading-relaxed text-[#c4bdb3]">We’ll return next summer with an entirely new collection. New designs. Familiar spirits.</p>
        <a href="#drop-alerts" className="mt-7 inline-flex min-h-12 items-center border border-[#c9a96e] px-5 py-3 text-sm text-[#d4b984]">Notify Me When Summerween Returns</a>
        {!retired && <div><Link href="/collections/summerween" className="mt-2 inline-flex min-h-11 items-center text-sm text-[#c4bdb3] underline underline-offset-4">Visit Summerween’s Final Haunt</Link></div>}
      </div>
      <section className="mx-auto w-full max-w-md" aria-labelledby="summerween-survivor">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4b984]">Bones &amp; Brews lives on</p>
        <h2 id="summerween-survivor" className="mb-6 font-serif text-3xl italic sm:text-4xl">The one that refused to die.</h2>
        <div className="relative aspect-[3/4] overflow-hidden border border-[#c9a96e]/25 bg-[#181318]">
          <Image src={SUMMERWEEN_MEMORY.image} alt="Model wearing the black Bones & Brews T-shirt with its small skeleton chest emblem" fill priority sizes="(max-width: 767px) 90vw, 448px" className="object-cover" />
        </div>
        <p className="mt-5 leading-relaxed text-[#c4bdb3]">Summerween has been laid to rest, but Bones &amp; Brews lives on. This Summerween original is staying in our year-round collection.</p>
        <p className="mt-3 text-sm leading-relaxed text-[#aaa095]">A little Summerween spirit, any time of year.</p>
        {survivor && <Link href={`/shop/${SUMMERWEEN_MEMORY.handle}`} className="mt-5 inline-flex min-h-12 items-center gap-4 border border-[#c9a96e] px-5 py-3 text-sm text-[#d4b984]">Shop Bones &amp; Brews <span aria-hidden="true">→</span></Link>}
      </section>
    </section>
    <section className="border-y border-[#c9a96e]/20 bg-[#191315] px-5 py-10 text-center">
      <p className="font-serif text-3xl italic">Until then, Autumn awaits.</p>
      <Link href="/collections/fall-2026" className="mt-4 inline-flex min-h-12 items-center gap-4 text-sm text-[#d4b984] underline underline-offset-4">Explore the Fall Collection <span aria-hidden="true">→</span></Link>
    </section>
    <DropAlertBand variant="archive" />
  </main><Footer /></>;
}
