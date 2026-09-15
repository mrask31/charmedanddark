"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ShopHero from "@/components/shop/ShopHero";
import ShopDestinations from "@/components/shop/ShopDestinations";
import StickyFilterBar from "@/components/shop/StickyFilterBar";
import SectionHeader from "@/components/shop/SectionHeader";
import ProductCard from "@/components/shop/ProductCard";
import { productPricing } from "@/lib/product-display";
import { SHOP_FILTERS, SHOP_SECTIONS, normalizeShopFilter, filterShopProducts, groupShopProducts } from "@/lib/shop-browse";
import { useSanctuaryAccess } from "@/hooks/useSanctuaryAccess";

export default function ShopPageClient({ products, initialFilter, initialQuery, initialCollection }) {
  const [activeFilter, setActiveFilter] = useState(normalizeShopFilter(initialFilter));
  const [searchQuery, setSearchQuery] = useState(typeof initialQuery === "string" ? initialQuery : "");
  const [collectionFilter, setCollectionFilter] = useState(typeof initialCollection === "string" ? initialCollection : "");
  const [sortOption, setSortOption] = useState("Featured");
  const { isMember } = useSanctuaryAccess();
  const hasOnSale = useMemo(() => products.some((p) => !p.hidden && productPricing(p).isOnSale), [products]);

  useEffect(() => {
    const url = new URL(window.location.href);
    activeFilter === 'ALL' ? url.searchParams.delete('category') : url.searchParams.set('category', activeFilter);
    searchQuery ? url.searchParams.set('q', searchQuery) : url.searchParams.delete('q');
    collectionFilter ? url.searchParams.set('collection', collectionFilter) : url.searchParams.delete('collection');
    window.history.replaceState(null, '', url);
  }, [activeFilter, searchQuery, collectionFilter]);

  useEffect(() => {
    const key = 'charmed-shop-scroll';
    const saved = sessionStorage.getItem(key);
    if (saved) requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: Number(saved) || 0, behavior: 'instant' })));
    const handleScroll = () => sessionStorage.setItem(key, String(Math.round(window.scrollY)));
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeFilter = (filter) => { setActiveFilter(filter); setCollectionFilter(''); };
  const resetFilters = () => { changeFilter('ALL'); setSearchQuery(''); setSortOption('Featured'); };
  const shown = useMemo(() => filterShopProducts(products, { category: activeFilter, query: searchQuery, collection: collectionFilter, sort: sortOption }), [products, activeFilter, searchQuery, collectionFilter, sortOption]);
  const groups = useMemo(() => groupShopProducts(shown), [shown]);
  const browseSections = activeFilter === 'ALL' && !searchQuery.trim() && !collectionFilter && sortOption === 'Featured';
  const resultTitle = searchQuery.trim() ? 'Search results' : activeFilter === 'ON_SALE' ? 'On sale' : SHOP_FILTERS.find((filter) => filter.id === activeFilter)?.label || 'All products';

  const productGrid = (items) => <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
    {items.map((product) => <ProductCard key={product.id} product={product} isMember={isMember} />)}
  </div>;

  return <main className="min-h-screen bg-black">
    <ShopHero />
    <ShopDestinations />
    <StickyFilterBar activeFilter={activeFilter} onFilterChange={changeFilter} sortOption={sortOption} onSortChange={setSortOption} hasOnSale={hasOnSale} searchQuery={searchQuery} onSearchChange={setSearchQuery} resultCount={shown.length} />
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10" id="shop-results">
      {collectionFilter && <div className="mb-8 flex items-center gap-4 text-sm text-zinc-300"><span>Collection: {collectionFilter.replaceAll('-', ' ')}</span><button type="button" onClick={() => setCollectionFilter('')} className="min-h-11 underline">Clear collection</button></div>}
      {browseSections ? SHOP_SECTIONS.map((section) => groups[section.id].length > 0 && <section key={section.id} className="mb-16 last:mb-0">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <SectionHeader title={section.title} subtitle={section.subtitle} />
          {section.id !== 'OTHER' && <Link href={section.href} className="inline-flex min-h-11 items-center text-sm text-[#d4b984] underline underline-offset-4">Explore {section.id === 'SGG' ? 'the collection' : SHOP_FILTERS.find((filter) => filter.id === section.id)?.label} <span aria-hidden="true" className="ml-2">→</span></Link>}
        </div>
        {productGrid(groups[section.id])}
      </section>) : shown.length > 0 && <section>
        <SectionHeader title={resultTitle === 'All' ? 'All products' : resultTitle} subtitle={activeFilter === 'SGG' ? SHOP_SECTIONS[0].subtitle : undefined} />
        {productGrid(shown)}
      </section>}
      {shown.length === 0 && <div className="py-16 text-center"><p className="text-zinc-300">No products match these filters.</p><button type="button" onClick={resetFilters} className="mt-5 min-h-11 border border-[#c9a96e] px-6 py-3 text-sm text-[#c9a96e]">View all products</button></div>}
    </div>
  </main>;
}
