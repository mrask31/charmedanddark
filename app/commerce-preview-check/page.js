import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: { absolute: 'Commerce responsive preview check' },
  robots: { index: false, follow: false },
};

const TARGETS = {
  home: { label: 'Home', path: '/' },
  shop: { label: 'Shop', path: '/shop' },
  bags: { label: 'Bag collection', path: '/collections/kiss-lock-bags' },
  sgg: { label: 'S.G.G. collection', path: '/collections/smutty-good-girl' },
  bag: { label: 'Physical bag', path: '/shop/celestial-kisslock-bag-in-linen-blended-fabric' },
  tee: { label: 'Softstyle tee', path: '/shop/unisex-softstyle-t-shirt' },
  bones: { label: 'Bones and Brew tee', path: '/shop/bones-and-brew-summer-unisex-tee-1' },
  drops: { label: 'Drops', path: '/drops' },
  journal: { label: 'Journal', path: '/journal' },
};

export default async function CommercePreviewCheck({ searchParams }) {
  if (process.env.VERCEL_ENV !== 'preview' && process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const query = await searchParams;
  const targetKey = typeof query?.target === 'string' && Object.hasOwn(TARGETS, query.target) ? query.target : 'home';
  const target = TARGETS[targetKey];
  const width = query?.width === '360' ? 360 : 390;
  const href = (nextTarget, nextWidth) => `/commerce-preview-check?target=${nextTarget}&width=${nextWidth}`;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-12 pt-28 text-zinc-100">
      <h1 className="text-2xl font-semibold">Commerce responsive preview check</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300">
        Internal QA for this preview. The frame loads the actual storefront at a narrow layout width.
        It checks responsive CSS and customer interactions; it does not emulate a phone’s touch input,
        virtual keyboard, browser chrome or pixel density. This route returns 404 in production.
      </p>
      <nav aria-label="Preview target" className="my-5 flex flex-wrap gap-2">
        {Object.entries(TARGETS).map(([key, value]) => (
          <Link key={key} href={href(key, width)} prefetch={false} aria-current={key === targetKey ? 'page' : undefined}
            className="inline-flex min-h-11 items-center rounded border border-zinc-600 px-3 text-sm focus-visible:outline focus-visible:outline-[#c9a96e] aria-[current=page]:border-[#c9a96e] aria-[current=page]:text-[#c9a96e]">
            {value.label}
          </Link>
        ))}
      </nav>
      <nav aria-label="Preview width" className="mb-4 flex items-center gap-3 text-sm">
        {[390, 360].map((size) => (
          <Link key={size} href={href(targetKey, size)} prefetch={false} aria-current={width === size ? 'page' : undefined}
            className="inline-flex min-h-11 items-center border border-zinc-600 px-3 focus-visible:outline focus-visible:outline-[#c9a96e] aria-[current=page]:border-[#c9a96e]">
            {size} px
          </Link>
        ))}
      </nav>
      <p className="mb-3 text-sm text-zinc-300">{target.label} · {width} × 844 CSS pixels</p>
      <div className="overflow-x-auto pb-4">
        <iframe key={`${targetKey}-${width}`} src={target.path} title={`Storefront at ${width} pixels`}
          width={width} height={844} style={{ width, minWidth: width, maxWidth: 'none', height: 844, border: 0, outline: '1px solid #52525b', display: 'block' }} />
      </div>
    </main>
  );
}
