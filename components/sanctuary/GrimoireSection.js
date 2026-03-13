import Link from 'next/link';
import { Lock, ChevronRight } from 'lucide-react';

const PLACEHOLDER_READINGS = [
  { id: '001', title: 'Reading Card #001', subtitle: 'Silence is rising tonight.' },
  { id: '002', title: 'Reading Card #002', subtitle: 'Softness is not surrender.' },
  { id: '003', title: 'Reading Card #003', subtitle: 'You do not need to be bright to be seen.' },
];

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function GrimoireSection({ access }) {
  const { isMember, grimoire, loading } = access;

  if (loading) {
    return (
      <section className="mx-auto max-w-[680px] px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/70">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[680px] px-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-white">
            Recent in your Grimoire
          </h3>
          {!isMember && (
            <span
              className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              LOCKED
            </span>
          )}
        </div>

        {isMember ? (
          <div className="mt-4 space-y-3">
            {grimoire && grimoire.length > 0 ? (
              grimoire.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/sanctuary/grimoire/${entry.id}`}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 transition-colors hover:bg-black/60"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{entry.title}</p>
                    <p className="text-xs text-white/70">{entry.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase tracking-wider text-white/50">
                      {formatDate(entry.created_at)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-white/40" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-white/70">
                Your Grimoire is empty. Readings you save will appear here.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-white/70">
              Your Grimoire appears when you join.
            </p>
            <div className="space-y-3">
              {PLACEHOLDER_READINGS.map((reading) => (
                <div
                  key={reading.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                >
                  <div className="space-y-1 blur-[2px] opacity-60">
                    <p className="text-sm font-medium text-white">{reading.title}</p>
                    <p className="text-xs text-white/70">{reading.subtitle}</p>
                  </div>
                  <Lock className="h-4 w-4 text-white/40" aria-hidden="true" />
                </div>
              ))}
            </div>
            <Link
              href="/join"
              className="inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors sm:w-auto"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #c9a96e',
                color: '#c9a96e',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(201,169,110,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Join Free
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
