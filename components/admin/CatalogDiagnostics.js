'use client';

import { useState } from 'react';

export default function CatalogDiagnostics() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function checkCatalog() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/catalog-diagnostics', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to check the catalog');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08080F] px-6 py-16 text-[#e8e4dc]">
      <div className="mx-auto max-w-2xl">
        <p className="mb-3 text-xs uppercase tracking-widest text-[#c9a96e]">Charmed &amp; Dark · Commerce Admin</p>
        <h1 className="mb-5 font-serif text-4xl">Catalog health</h1>
        <p className="mb-6 leading-relaxed text-zinc-300">
          Manage product details, prices, availability and collections in Shopify.
          Storefront product changes refresh automatically. Use this check to review
          catalog access and existing product links.
        </p>
        <button type="button" onClick={checkCatalog} disabled={loading}
          className="min-h-11 border border-[#c9a96e] px-5 py-3 text-sm text-[#c9a96e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9a96e] disabled:opacity-50">
          {loading ? 'Checking catalog…' : 'Check catalog health'}
        </button>
        <p className="mt-3 text-sm text-zinc-400">This check only reads data.</p>
        {error && <p role="alert" className="mt-6 text-red-300">{error}</p>}
        <div aria-live="polite" aria-busy={loading}>
          {result && (
            <section className="mt-8 border border-white/10 p-5">
              <h2 className="font-serif text-2xl">Catalog is reachable</h2>
              <p className="mt-2 text-sm text-zinc-400">Checked {new Date(result.checkedAt).toLocaleString()}</p>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <dt>Product source</dt><dd>{result.source}</dd>
                <dt>Shopify API version</dt><dd>{result.apiVersion}</dd>
                <dt>Published products</dt><dd>{result.products}</dd>
                <dt>Available products</dt><dd>{result.availableProducts}</dd>
                <dt>Variants</dt><dd>{result.variants}</dd>
                <dt>Preserved historical references</dt><dd>{result.identityRows}</dd>
                <dt>New products</dt><dd>{result.newProductsWithoutLegacyIdentity}</dd>
                <dt>Archived products outside publication</dt><dd>{result.archivedProductsNotPublished}</dd>
              </dl>
              <p className="mt-5 text-sm text-zinc-400">
                New products work without historical references. Archived references are retained for existing links and application history.
              </p>
              {result.ambiguousAliases.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-medium text-amber-200">Product links needing review</h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-zinc-300">
                    {result.ambiguousAliases.map((alias) => <li key={alias}>{alias}</li>)}
                  </ul>
                </div>
              )}
              {result.productsMissingImages.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-medium text-amber-200">Products missing an image</h3>
                  <ul className="mt-2 list-inside list-disc text-sm text-zinc-300">
                    {result.productsMissingImages.map((handle) => <li key={handle}>{handle}</li>)}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
