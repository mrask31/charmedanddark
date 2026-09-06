"use client";

export default function StickyFilterBar({
  activeFilter,
  onFilterChange,
  sortOption,
  onSortChange,
  hasOnSale = false,
  searchQuery = "",
  onSearchChange,
  resultCount = 0,
}) {
  const filters = [
    { id: "ALL", label: "ALL" },
    ...(hasOnSale ? [{ id: "ON_SALE", label: "SALE" }] : []),
    { id: "SGG", label: "SMUTTY GOOD GIRL" },
    { id: "ACCESSORIES", label: "ACCESSORIES" },
    { id: "RITUAL", label: "CANDLES & RITUAL" },
    { id: "HOME", label: "HOME" },
    { id: "APPAREL", label: "APPAREL" },
    { id: "WALL_ART", label: "WALL ART" },
  ];

  const sortOptions = [
    "Featured",
    "Price: Low to High",
    "Price: High to Low",
    "Newest",
  ];

  return (
    <div
      className="sticky top-[72px] z-40 bg-black/95 backdrop-blur-sm"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <style>{`.filter-scroll::-webkit-scrollbar { display: none }`}</style>

      {/* Row 1: category filter pills */}
      <div
        role="group"
        aria-label="Product categories"
        className="filter-scroll mx-auto max-w-7xl"
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          width: '100%',
        }}
      >
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#c9a96e]"
            aria-pressed={activeFilter === filter.id}
            aria-controls="shop-results"
            onClick={() => onFilterChange(filter.id)}
            style={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
              padding: '12px 16px',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              background: 'transparent',
              color: activeFilter === filter.id ? '#c9a96e' : 'rgba(255,255,255,0.65)',
              borderBottom: activeFilter === filter.id ? '2px solid #c9a96e' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Row 2: sort dropdown */}
      <div
        className="mx-auto max-w-7xl"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
        }}
      >
        <label className="mr-auto flex w-full basis-full items-center gap-3 text-xs text-zinc-300 sm:w-auto sm:min-w-0 sm:flex-1 sm:basis-auto">
          <span className="sr-only">Search products</span>
          <input type="search" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search the shop" className="min-w-0 w-full sm:max-w-xs border border-zinc-700 bg-black px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus:border-[#c9a96e] focus:outline-none" />
        </label>
        <span role="status" aria-live="polite" className="text-xs text-zinc-400">{resultCount} products</span>
        <label htmlFor="shop-sort" className="text-xs uppercase tracking-[0.2em] text-zinc-400">Sort</label>
        <select
          id="shop-sort"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
          className="border-0 bg-transparent text-xs uppercase tracking-[0.2em] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9a96e]"
        >
          {sortOptions.map((option) => (
            <option key={option} value={option} className="bg-black">
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
