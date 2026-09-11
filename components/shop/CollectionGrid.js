"use client";

import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { filterCollectionProducts } from '@/lib/discovery';
import { useAuth } from '@/context/AuthContext';

export default function CollectionGrid({ products }) {
  const { isMember } = useAuth();
  const [type, setType] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState('featured');
  const types = [...new Set(products.map((p) => p.productType).filter(Boolean))].sort();
  const valuesFor = (name) => [...new Set(products.flatMap((p) => p.shopifyVariants?.options || [])
    .filter((o) => o.name.toLowerCase() === name).flatMap((o) => o.values))].sort();
  const sizes = valuesFor('size');
  const colors = valuesFor('color');
  const shown = useMemo(() => {
    const result = filterCollectionProducts(products, { type, size, color, available });
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, type, size, color, available, sort]);
  const selectClass = 'min-h-11 w-full border border-zinc-600 bg-[#101018] px-3 py-2 text-sm text-white focus-visible:outline-2 focus-visible:outline-[#c9a96e]';
  return <section aria-label="Collection products" className="mt-10">
    <div className="mb-8 flex flex-wrap items-end gap-4 border-y border-zinc-800 py-5">
      {[[types, type, setType, 'Product type'], [sizes, size, setSize, 'Size'], [colors, color, setColor, 'Color']].map(([values, value, setter, label]) => values.length > 1 &&
        <label key={label} className="min-w-32 flex-1 space-y-2 text-xs text-zinc-300">{label}
          <select className={selectClass} value={value} onChange={(e) => setter(e.target.value)}>
            <option value="">All</option>{values.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>)}
      <label className="min-w-40 flex-1 space-y-2 text-xs text-zinc-300">Sort by
        <select className={selectClass} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
        </select>
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />Available to order</label>
    </div>
    <p role="status" className="mb-6 text-sm text-zinc-400">{shown.length} {shown.length === 1 ? 'item' : 'items'}</p>
    {shown.length ? <div className="grid grid-cols-1 gap-x-6 gap-y-12 min-[360px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {shown.map((product) => <ProductCard key={product.id} product={product} isMember={isMember} />)}
    </div> : <div className="py-12 text-center"><p>No items match these filters.</p><button className="mt-4 min-h-11 underline" onClick={() => { setType(''); setSize(''); setColor(''); setAvailable(false); }}>Clear filters</button></div>}
  </section>;
}
