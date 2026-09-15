import Image from 'next/image';
import Link from 'next/link';

export function HomepageFallFeature({ products, summerweenRetired }) {
  const photos = ['autumn-mourning-society-gothic-pullover-hoodie', 'autumn-skull-gothic-zip-up-hoodie']
    .map((handle) => products.find((p) => (p.handle || p.slug) === handle))
    .filter((p) => p?.imageUrls?.[0]);
  if (!products.length) return null;
  return <section aria-labelledby="home-fall" className="border-y border-[#c9a96e]/25 bg-[#181314]">
    <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:gap-12 lg:px-10">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[#d4b984]">The Fall Collection · 2026</p>
        <p className="mt-5 font-serif text-2xl text-[#c4bdb3]">{summerweenRetired ? 'Summerween rests in peace.' : 'Summerween takes its final bow.'}</p>
        <h2 id="home-fall" className="mt-2 font-serif text-5xl italic leading-tight text-[#f5f0e8] sm:text-6xl">Autumn awakens.</h2>
        <p className="mt-5 max-w-md text-base leading-relaxed text-[#d0c8bd]">Longer nights. Darker layers. Meet the first pieces of our Fall collection.</p>
        <Link href="/collections/fall-2026" className="mt-7 inline-flex min-h-12 items-center gap-4 border border-[#c9a96e] bg-[#c9a96e] px-5 py-3 text-sm text-black transition-colors hover:bg-[#dfc28f]">Shop the Fall Collection <span aria-hidden="true">→</span></Link>
        <div className="mt-3"><Link href={summerweenRetired ? '/deceased' : '/last-chance'} className="inline-flex min-h-11 items-center text-sm text-[#c4bdb3] underline underline-offset-4">{summerweenRetired ? 'Summerween: gone, never forgotten' : 'Summerween’s Final Haunt'}</Link></div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {photos.map((product, index) => <Link key={product.id} href="/collections/fall-2026" className={`relative block aspect-[3/4] overflow-hidden bg-[#211b1b] ${index ? 'mt-8' : 'mb-8'}`}>
          <Image src={product.imageUrls[0]} alt={product.name || product.title} fill sizes="(max-width: 1023px) 45vw, 280px" className="object-cover" />
        </Link>)}
      </div>
    </div>
  </section>;
}
