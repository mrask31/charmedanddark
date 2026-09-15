import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { summerweenSeason, SUMMERWEEN_MEMORY } from '@/lib/seasonal-collections';
import DropAlertBand from '@/components/drops/DropAlertBand';
import { Footer } from '@/components/footer';

export const revalidate = 60;
export const metadata = {
  title: 'Deceased — The Summerween Collection Archive',
  description: 'Gone for the season. Never forgotten. Remember Summerween at Charmed & Dark and follow its return next summer with all-new designs.',
  alternates: { canonical: 'https://www.charmedanddark.com/deceased' },
};

export default async function DeceasedPage() {
  const { retired, remaining } = summerweenSeason(await getProducts());
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
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#aaa095]">The next collection will feature new designs; this is not a restock announcement for the pieces shown here.</p>
        <a href="#drop-alerts" className="mt-7 inline-flex min-h-12 items-center border border-[#c9a96e] px-5 py-3 text-sm text-[#d4b984]">Notify Me When Summerween Returns</a>
        {!retired && <div><Link href="/collections/summerween" className="mt-2 inline-flex min-h-11 items-center text-sm text-[#c4bdb3] underline underline-offset-4">Visit Summerween’s Final Haunt</Link></div>}
      </div>
      <figure className="mx-auto w-full max-w-md">
        <div className="relative aspect-[3/4] overflow-hidden border border-[#c9a96e]/25 bg-[#181318]">
          <Image src={SUMMERWEEN_MEMORY.image} alt={`${SUMMERWEEN_MEMORY.title}, collection photograph`} fill priority sizes="(max-width: 767px) 90vw, 448px" className="object-cover saturate-50 brightness-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b0f]/75 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 font-serif text-2xl italic">{retired ? 'Gone for the season.' : 'The season fades.'}<br />Never forgotten.</p>
        </div>
        <figcaption className="mt-4 text-center text-xs tracking-wider text-[#aaa095]">{retired ? 'From the departed collection' : 'A look back at Summerween'} · Bones &amp; Brews</figcaption>
      </figure>
    </section>
    <section className="border-y border-[#c9a96e]/20 bg-[#191315] px-5 py-10 text-center">
      <p className="font-serif text-3xl italic">Until then, Autumn awaits.</p>
      <Link href="/collections/fall-2026" className="mt-4 inline-flex min-h-12 items-center gap-4 text-sm text-[#d4b984] underline underline-offset-4">Explore the Fall Collection <span aria-hidden="true">→</span></Link>
    </section>
    <DropAlertBand variant="archive" />
  </main><Footer /></>;
}
