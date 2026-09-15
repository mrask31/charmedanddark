"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ShopHero from "@/components/shop/ShopHero";
import StickyFilterBar from "@/components/shop/StickyFilterBar";
import SectionHeader from "@/components/shop/SectionHeader";
import ProductCard from "@/components/shop/ProductCard";
import { productPricing } from "@/lib/product-display";
import { SHOP_FILTERS, SHOP_SECTIONS, normalizeShopFilter, filterShopProducts, shopSectionPreviews } from "@/lib/shop-browse";
import { useSanctuaryAccess } from "@/hooks/useSanctuaryAccess";

export default function ShopPageClient({ products, initialFilter, initialQuery, initialCollection, initialView }) {
  const [activeFilter, setActiveFilter] = useState(normalizeShopFilter(initialFilter));
  const [searchQuery, setSearchQuery] = useState(typeof initialQuery === "string" ? initialQuery : "");
  const [collectionFilter, setCollectionFilter] = useState(typeof initialCollection === "string" ? initialCollection : "");
  const [sortOption, setSortOption] = useState("Featured");
  const [view, setView] = useState(initialView === 'all' ? 'all' : 'featured');
  const { isMember } = useSanctuaryAccess();
  const hasOnSale = useMemo(() => products.some((p) => !p.hidden && productPricing(p).isOnSale), [products]);

  useEffect(() => {
    const url = new URL(window.location.href);
    activeFilter === 'ALL' ? url.searchParams.delete('category') : url.searchParams.set('category', activeFilter);
    searchQuery ? url.searchParams.set('q', searchQuery) : url.searchParams.delete('q');
    collectionFilter ? url.searchParams.set('collection', collectionFilter) : url.searchParams.delete('collection');
    view === 'all' ? url.searchParams.set('view', 'all') : url.searchParams.delete('view');
    window.history.replaceState(null, '', url);
  }, [activeFilter, searchQuery, collectionFilter, view]);

  useEffect(() => {
    const key = 'charmed-shop-scroll';
    const saved = sessionStorage.getItem(key);
    if (saved) requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: Number(saved) || 0, behavior: 'instant' })));
    const handleScroll = () => sessionStorage.setItem(key, String(Math.round(window.scrollY)));
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeFilter = (filter) => {
    setActiveFilter(filter === 'FEATURED' ? 'ALL' : filter);
    setView(filter === 'FEATURED' ? 'featured' : 'all');
    setCollectionFilter('');
    if (filter === 'FEATURED') { setSearchQuery(''); setSortOption('Featured'); }
  };
  const resetFilters = () => { changeFilter('ALL'); setSearchQuery(''); setSortOption('Featured'); };
  const shown = useMemo(() => filterShopProducts(products, { category: activeFilter, query: searchQuery, collection: collectionFilter, sort: sortOption }), [products, activeFilter, searchQuery, collectionFilter, sortOption]);
  const sections = useMemo(() => shopSectionPreviews(shown), [shown]);
  const browseSections = view === 'featured' && activeFilter === 'ALL' && !searchQuery.trim() && !collectionFilter && sortOption === 'Featured';
  const displayedCount = browseSections ? sections.reduce((count, section) => count + section.products.length, 0) : shown.length;
  const resultTitle = searchQuery.trim() ? 'Search results' : activeFilter === 'ON_SALE' ? 'On sale' : SHOP_FILTERS.find((filter) => filter.id === activeFilter)?.label || 'All products';

  const productGrid = (items) => <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
    {items.map((product) => <ProductCard key={product.id} product={product} isMember={isMember} />)}
  </div>;

  return <main className="min-h-screen bg-black">
    <ShopHero />
    <StickyFilterBar activeFilter={browseSections ? 'FEATURED' : activeFilter} onFilterChange={changeFilter} sortOption={sortOption} onSortChange={setSortOption} hasOnSale={hasOnSale} searchQuery={searchQuery} onSearchChange={setSearchQuery} resultCount={shown.length} displayedCount={displayedCount} featured={browseSections} />
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10" id="shop-results">
      {collectionFilter && <div className="mb-8 flex items-center gap-4 text-sm text-zinc-300"><span>Collection: {collectionFilter.replaceAll('-', ' ')}</span><button type="button" onClick={() => setCollectionFilter('')} className="min-h-11 underline">Clear collection</button></div>}
      {browseSections && <div className="mb-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
        <p className="text-[#c4bdb3]">A few favorites from each corner of the shop.</p>
        <Link href="/shop?view=all" className="inline-flex min-h-11 items-center text-[#d4b984] underline underline-offset-4">Shop all {shown.length} pieces <span aria-hidden="true" className="ml-2">→</span></Link>
      </div>}
      {browseSections ? sections.map((section) => <section key={section.id} className="mb-16 last:mb-0">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#d4b984]">{section.id === 'SGG' ? 'The featured collection' : SHOP_FILTERS.find((filter) => filter.id === section.id)?.label || 'Explore more'}</p>
            <h2 className="font-serif text-3xl text-[#f5f0e8] sm:text-4xl">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#c4bdb3]">{section.subtitle}</p>
          </div>
          <Link href={section.id === 'OTHER' ? '/shop?view=all' : section.href} className="inline-flex min-h-11 items-center text-sm text-[#d4b984] underline underline-offset-4" aria-label={`View all ${section.id === 'OTHER' ? 'products' : SHOP_FILTERS.find((filter) => filter.id === section.id)?.label}`}>View all{section.id !== 'OTHER' ? ` (${section.total})` : ''} <span aria-hidden="true" className="ml-2">→</span></Link>
        </div>
        {productGrid(section.products)}
      </section>) : shown.length > 0 && <section>
        <SectionHeader title={resultTitle === 'Shop all' ? 'All products' : resultTitle} subtitle={activeFilter === 'SGG' ? SHOP_SECTIONS[0].subtitle : undefined} />
        {productGrid(shown)}
      </section>}
      {shown.length === 0 && <div className="py-16 text-center"><p className="text-zinc-300">No products match these filters.</p><button type="button" onClick={resetFilters} className="mt-5 min-h-11 border border-[#c9a96e] px-6 py-3 text-sm text-[#c9a96e]">View all products</button></div>}
    </div>
  </main>;
}
