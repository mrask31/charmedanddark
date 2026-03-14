"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@sanity/client';

/**
 * Lazily create the Sanity client only when projectId is available.
 * Prevents build-time crash when env vars are missing during static prerendering.
 */
function getSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) return null;

  return createClient({
    projectId,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: true,
  });
}

const GROQ_QUERY = `*[_type == "currentDrop"][0]{
  dropName,
  previewDate,
  releaseDate,
  sanctuaryAccessDate
}`;

/**
 * Format a date string as "MMM DD, YYYY" or return "TBA" for missing/invalid dates.
 * Exported for testing.
 */
export function formatDate(dateString) {
  if (!dateString) return 'TBA';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'TBA';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'TBA';
  }
}

const STATUS_COLUMNS = [
  { key: 'previewDate', label: 'PREVIEW WINDOW' },
  { key: 'releaseDate', label: 'RELEASE WINDOW' },
  { key: 'sanctuaryAccessDate', label: 'SANCTUARY EARLY ACCESS' },
];

export default function NextDrop() {
  const [dropData, setDropData] = useState({
    dropName: null,
    previewDate: null,
    releaseDate: null,
    sanctuaryAccessDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDrop() {
      const client = getSanityClient();
      if (!client) {
        setLoading(false);
        return;
      }

      try {
        const data = await client.fetch(GROQ_QUERY);
        if (data) setDropData(data);
      } catch (error) {
        console.error('Failed to fetch drop data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDrop();
  }, []);

  const displayName = dropData.dropName || 'Coming Soon';

  return (
    <section className="space-y-6" aria-labelledby="next-drop-heading">
      {/* Eyebrow */}
      <p
        className="text-[11px] uppercase tracking-[0.3em]"
        style={{ color: '#c9a96e' }}
        aria-label="Section label"
      >
        NEXT DROP
      </p>

      {/* Drop Name */}
      <h2
        id="next-drop-heading"
        className="font-serif text-4xl italic text-white md:text-5xl"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
      >
        {displayName}
      </h2>

      {/* Subtext */}
      <p
        className="max-w-2xl text-base font-light"
        style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
      >
        When the window opens, the Threshold shifts. Join to be notified first.
      </p>

      {/* Status Strip */}
      <div className="relative mt-8" role="region" aria-label="Drop schedule information">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {STATUS_COLUMNS.map(({ key, label }) => (
            <article
              key={key}
              className="relative p-4 text-center sm:p-6"
              style={{
                backgroundColor: '#0e0e1a',
                borderTop: '2px solid #c9a96e',
              }}
            >
              <h3
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: '#c9a96e' }}
              >
                {label}
              </h3>
              <p
                className="mt-3 font-serif text-base sm:text-lg"
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  color: '#e8e4dc',
                }}
              >
                {formatDate(dropData[key])}
              </p>
            </article>
          ))}
        </div>

        {/* Thin horizontal gold connecting line with pulse animation - decorative */}
        <div
          className="gold-pulse-line absolute left-0 right-0 top-1/2 hidden h-[1px] -translate-y-1/2 md:block"
          style={{ backgroundColor: '#c9a96e' }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
