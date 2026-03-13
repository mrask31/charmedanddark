"use client";

import { useSanctuaryAccess } from '@/hooks/useSanctuaryAccess';

const archiveCards = [
  { id: 'obsidian', title: 'OBSIDIAN ARCHIVE' },
  { id: 'eclipse', title: 'ECLIPSE VAULT' },
  { id: 'nocturne', title: 'NOCTURNE SHELF' },
];

export default function DropsArchive() {
  const { isMember } = useSanctuaryAccess();

  return (
    <section className="space-y-6" aria-labelledby="archive-heading">
      {/* Heading row */}
      <div className="flex items-center gap-3">
        <h2
          id="archive-heading"
          className="font-serif text-4xl italic text-white md:text-5xl"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          Archive
        </h2>
        {!isMember && (
          <span
            className="text-[10px] uppercase tracking-[0.3em] px-3 py-1"
            style={{
              color: '#c9a96e',
              border: '1px solid rgba(201, 169, 110, 0.4)',
              borderRadius: '0px',
            }}
            role="status"
            aria-label="Archive is locked for non-members"
          >
            LOCKED
          </span>
        )}
      </div>

      {/* Subtext */}
      <p
        className="max-w-2xl text-base font-light"
        style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
      >
        Past drops, preserved in the dark. Join to unlock the archive.
      </p>

      {/* Archive Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Archive collections">
        {archiveCards.map((card) => (
          <article
            key={card.id}
            className="archive-card relative transition-shadow duration-300 focus-within:ring-2 focus-within:ring-[#c9a96e] focus-within:ring-offset-2 focus-within:ring-offset-[#08080f]"
            style={{
              aspectRatio: '3 / 4',
              backgroundColor: '#0e0e1a',
              border: '1px solid rgba(201, 169, 110, 0.15)',
              borderRadius: '0px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(201, 169, 110, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            role="listitem"
            aria-label={`${card.title} - ${isMember ? 'Unlocked' : 'Locked for non-members'}`}
          >
            {/* Card label */}
            <h3
              className="p-4 text-[10px] uppercase tracking-[0.3em]"
              style={{ color: '#c9a96e' }}
            >
              {card.title}
            </h3>

            {/* Lock overlay for non-members */}
            {!isMember && (
              <>
                <div
                  className="absolute inset-0"
                  style={{
                    backdropFilter: 'blur(4px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  }}
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c9a96e"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-label="Locked content"
                    role="img"
                  >
                    <title>Locked</title>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </>
            )}

            {/* Unlocked content for members */}
            {isMember && (
              <div className="p-4">
                <p
                  className="text-sm font-light"
                  style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
                >
                  Archive content for {card.title}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
