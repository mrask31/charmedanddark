import { Flame, Rose, Moon, Star } from 'lucide-react';

const resonanceItems = [
  { label: 'Candle', count: 12, Icon: Flame },
  { label: 'Rose', count: 7, Icon: Rose },
  { label: 'Moon', count: 4, Icon: Moon },
  { label: 'Star', count: 9, Icon: Star },
];

export default function ResonanceBar() {
  return (
    <section 
      className="w-full py-6"
      style={{
        backgroundColor: '#08080f',
        borderTop: '1px solid #c9a96e',
        borderBottom: '1px solid #c9a96e',
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 md:flex-row md:items-center">
        {/* Left: Label */}
        <div>
          <p 
            className="text-xs uppercase tracking-[0.3em]"
            style={{ color: '#c9a96e' }}
          >
            Resonance
          </p>
          <p className="mt-1 text-sm text-white/70">
            Community energy this week
          </p>
        </div>

        {/* Right: Pills */}
        <div className="flex flex-wrap gap-3">
          {resonanceItems.map(({ label, count, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full px-4 py-2"
              style={{
                backgroundColor: '#0e0e1a',
                border: '1px solid #c9a96e',
              }}
            >
              <Icon 
                className="h-4 w-4" 
                style={{ color: '#c9a96e' }}
                aria-hidden="true"
              />
              <span 
                className="text-xs uppercase tracking-[0.2em]"
                style={{ color: '#c9a96e' }}
              >
                {label} {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
