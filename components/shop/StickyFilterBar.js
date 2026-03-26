"use client";

export default function StickyFilterBar({
  activeFilter,
  onFilterChange,
  sortOption,
  onSortChange
}) {
  const filters = [
    { id: "ALL", label: "ALL" },
    { id: "HOME", label: "HOME" },
    { id: "APPAREL", label: "APPAREL" },
    { id: "ACCESSORIES", label: "ACCESSORIES" },
    { id: "RITUAL", label: "RITUAL" },
    { id: "WALL_ART", label: "WALL ART" },
    { id: "STICKERS", label: "STICKERS" },
  ];

  const sortOptions = [
    "Featured",
    "Price: Low to High",
    "Price: High to Low",
    "Newest",
  ];

  return (
    <div className="sticky top-[72px] z-40 border-b border-white/10 bg-black/95 backdrop-blur-sm">
      <style>{`.filter-scroll::-webkit-scrollbar { display: none }`}</style>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div
          className="filter-scroll"
          style={{
            display: 'flex',
            flexDirection: 'row',
            overflowX: 'auto',
            gap: '8px',
            padding: '0 16px 8px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            flex: 1,
          }}
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              style={{
                flexShrink: 0,
                whiteSpace: 'nowrap',
                padding: '6px 14px',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
                border: 'none',
                background: 'transparent',
                color: activeFilter === filter.id ? '#c9a96e' : 'rgba(255,255,255,0.4)',
                borderBottom: activeFilter === filter.id ? '1px solid #c9a96e' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Sort
          </span>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="border-0 bg-transparent text-xs uppercase tracking-[0.2em] text-white focus:outline-none focus:ring-0"
          >
            {sortOptions.map((option) => (
              <option key={option} value={option} className="bg-black">
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
