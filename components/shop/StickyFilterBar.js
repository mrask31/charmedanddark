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
    <div
      className="sticky top-[72px] z-40 bg-black/95 backdrop-blur-sm"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <style>{`.filter-scroll::-webkit-scrollbar { display: none }`}</style>

      {/* Row 1: category filter pills */}
      <div
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
              color: activeFilter === filter.id ? '#c9a96e' : 'rgba(255,255,255,0.4)',
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
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
        }}
      >
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
  );
}
