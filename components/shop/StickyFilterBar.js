"use client";

import { SHOP_FILTERS } from "@/lib/shop-browse";

export default function StickyFilterBar({ activeFilter, onFilterChange, sortOption, onSortChange, hasOnSale = false, searchQuery = "", onSearchChange, resultCount = 0, displayedCount = resultCount, featured = false }) {
  const filters = [{ id: 'FEATURED', label: 'Explore' }, ...SHOP_FILTERS, ...(hasOnSale ? [{ id: 'ON_SALE', label: 'Sale' }] : [])];
  const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'];
  const selectClass = 'min-h-11 w-full min-w-0 rounded-none border border-white/20 bg-[#101014] px-3 text-sm text-[#f5f0e8] focus-visible:outline-2 focus-visible:outline-[#c9a96e]';
  const count = featured ? `${displayedCount} featured · ${resultCount} in the shop` : `${resultCount} ${resultCount === 1 ? 'product' : 'products'}`;
  const search = <label className="block min-w-0"><span className="sr-only">Search products</span>
    <input type="search" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Find your next favorite" className="min-h-11 w-full min-w-0 rounded-none border border-white/20 bg-transparent px-3 text-sm text-white placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-[#c9a96e]" />
  </label>;

  return <>
    <div className="bg-[#08080a] px-5 pt-3 sm:px-8 md:hidden" data-shop-search>
      {search}
      <p role="status" aria-live="polite" className="mt-2 text-xs text-[#c4bdb3]">{count}</p>
    </div>
    <div data-shop-controls className="sticky top-[72px] z-40 border-b border-white/10 bg-[#08080a]/95 backdrop-blur-sm">
    <div role="group" aria-label="Product categories" className="mx-auto hidden max-w-7xl overflow-x-auto px-5 md:flex lg:px-10">
      {filters.map((filter) => <button key={filter.id} type="button" aria-pressed={activeFilter === filter.id} aria-controls="shop-results" onClick={() => onFilterChange(filter.id)} className={`min-h-12 shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#c9a96e] ${activeFilter === filter.id ? 'border-[#c9a96e] text-[#d4b984]' : 'border-transparent text-[#c4bdb3] hover:text-white'}`}>{filter.label}</button>)}
    </div>
    <div className="mx-auto grid max-w-7xl grid-cols-2 items-center gap-3 px-5 py-3 sm:px-8 md:flex md:flex-wrap lg:px-10">
      <label className="min-w-0 md:hidden"><span className="sr-only">Browse the shop</span>
        <select value={activeFilter} onChange={(event) => onFilterChange(event.target.value)} className={selectClass}>{filters.map((filter) => <option key={filter.id} value={filter.id}>{filter.label}</option>)}</select>
      </label>
      <div className="hidden min-w-0 md:mr-auto md:block md:max-w-sm md:flex-1">{search}</div>
      <label className="col-start-2 row-start-1 min-w-0 md:w-44"><span className="sr-only">Sort</span>
        <select id="shop-sort" value={sortOption} onChange={(event) => onSortChange(event.target.value)} className={selectClass}>{sortOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select>
      </label>
      <span role="status" aria-live="polite" className="hidden text-xs text-[#c4bdb3] md:block">{count}</span>
    </div>
    </div>
  </>;
}
