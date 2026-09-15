export const BROWSE_RETURN_KEY = '__charmedBrowseReturn';
export const SHOP_SORTS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'];

export function shopStateFromParams(params) {
  return {
    category: params.get('category') || 'ALL',
    query: params.get('q') || '',
    collection: params.get('collection') || '',
    view: params.get('view') === 'all' ? 'all' : 'featured',
    sort: SHOP_SORTS.includes(params.get('sort')) ? params.get('sort') : 'Featured',
  };
}

export function collectionStateFromParams(params) {
  return {
    type: params.get('type') || '', size: params.get('size') || '', color: params.get('color') || '',
    available: params.get('available') === 'true',
    sort: ['price-asc', 'price-desc'].includes(params.get('sort')) ? params.get('sort') : 'featured',
  };
}

export function updatedBrowseUrl(href, changes) {
  const url = new URL(href);
  for (const [key, value] of Object.entries(changes)) {
    if (value === '' || value == null || value === false) url.searchParams.delete(key);
    else url.searchParams.set(key, String(value));
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function browseReturnSnapshot(state, url) {
  const saved = state?.[BROWSE_RETURN_KEY];
  return saved?.url === url && Number.isFinite(saved.y) && saved.y >= 0 ? saved : null;
}
