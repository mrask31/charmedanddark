import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDiscoveryCollection } from '@/lib/discovery-server';
import CollectionGrid from '@/components/shop/CollectionGrid';
import { Footer } from '@/components/footer';

export const revalidate = 60;
export async function generateMetadata({ params }) {
  const { handle } = await params;
  const collection = await getDiscoveryCollection(handle);
  if (!collection) return { title: 'Collection not found', robots: { index: false, follow: false } };
  return { title: collection.seo?.title || collection.title, description: collection.seo?.description || collection.description,
    alternates: { canonical: `https://www.charmedanddark.com/collections/${handle}` } };
}
export default async function CollectionPage({ params }) {
  const { handle } = await params;
  const collection = await getDiscoveryCollection(handle);
  if (!collection) notFound();
  const summerween = handle === 'summerween';
  const isFarewell = collection.products.some((p) => p.tags?.includes('lifecycle:last-chance'));
  const schema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Shop', item: 'https://www.charmedanddark.com/shop' },
    { '@type': 'ListItem', position: 2, name: collection.label, item: `https://www.charmedanddark.com/collections/${handle}` },
  ] };
  return <><main className="mx-auto max-w-7xl px-6 pb-24 pt-10 lg:px-12">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-zinc-400"><Link href="/shop" className="underline">Shop</Link><span aria-hidden="true"> / </span><span aria-current="page">{collection.label}</span></nav>
    <h1 className="font-serif text-4xl text-[#f5f0e8] sm:text-5xl">{collection.title}</h1>
    <p className="mt-5 max-w-3xl text-base leading-relaxed text-zinc-300">{collection.description}</p>
    {summerween && <aside className="mt-8 border border-[#c9a96e]/40 bg-[#17131b] p-6">
      <h2 className="font-serif text-2xl">{collection.products.length ? (isFarewell ? 'Summerween’s Final Haunt' : 'Summerween is here') : 'Summerween returns next summer'}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">{collection.products.length ? (isFarewell ? 'This season’s designs are taking their final bow. These items are made to order. Summerween returns next summer with a new collection of designs.' : 'Halloween spirit, summer style. Explore the current collection of made-to-order Summerween designs.') : 'This season has closed. A new collection of Summerween designs will arrive next summer. Explore what is new or sign up for drop announcements.'}</p>
      <Link href="/drops#drop-alerts" className="mt-4 inline-block py-2 text-sm text-[#c9a96e] underline">Get future drop announcements</Link>
    </aside>}
    {collection.products.length ? <CollectionGrid products={collection.products} /> : <p className="my-12 text-zinc-300">There are no items available in this collection right now. <Link href="/shop" className="underline">Explore the shop</Link>.</p>}
    <nav aria-label="More to explore" className="mt-12 flex flex-wrap gap-6 text-sm text-[#c9a96e]"><Link href="/shop">Shop all</Link><Link href="/drops">New & upcoming drops</Link><Link href="/last-chance">Last Chance</Link></nav>
  </main><Footer /></>;
}
