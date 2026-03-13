"use client";

import { useSanctuaryAccess } from '@/hooks/useSanctuaryAccess';

export default function DropsStickBar({ onJoinClick }) {
  const { isMember } = useSanctuaryAccess();

  if (isMember) {
    return null;
  }

  return (
    <aside
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur"
      style={{
        backgroundColor: 'rgba(8, 8, 15, 0.92)',
        borderTop: '1px solid #c9a96e',
      }}
      role="complementary"
      aria-label="Membership call to action"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row sm:px-6 sm:py-4">
        <p
          className="text-center text-[10px] uppercase tracking-[0.3em] sm:text-left sm:text-[11px]"
          style={{ color: '#e8e4dc' }}
        >
          JOIN FREE TO UNLOCK EARLY ACCESS AND SANCTUARY PRICING.
        </p>
        <button
          onClick={onJoinClick}
          className="w-full whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(8,8,15,0.92)] sm:w-auto"
          style={{
            border: '1px solid #c9a96e',
            color: '#c9a96e',
          }}
          aria-label="Join the Sanctuary for free"
        >
          JOIN FREE
        </button>
      </div>
    </aside>
  );
}
