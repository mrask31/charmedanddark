import Link from 'next/link';
import { Lock } from 'lucide-react';

function FeatureCard({ title, badge, description, buttonLabel, buttonHref, buttonAction, isLocked }) {
  const cardStyle = {
    backgroundColor: '#0e0e1a',
    border: '1px solid rgba(201,169,110,0.2)',
  };

  return (
    <div
      className="group relative rounded-2xl p-6 transition-shadow hover:shadow-[0_0_20px_rgba(201,169,110,0.08)]"
      style={cardStyle}
      data-feature-card
      data-card-status={isLocked ? 'locked' : 'unlocked'}
    >
      {/* Badge */}
      {badge && (
        <span
          className="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em]"
          style={{
            backgroundColor: badge === 'PREVIEW' ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.05)',
            color: badge === 'PREVIEW' ? '#c9a96e' : '#fff',
            border: badge === 'LOCKED' ? '1px solid rgba(255,255,255,0.1)' : 'none',
          }}
          data-badge={badge}
        >
          {badge}
        </span>
      )}

      {/* Title */}
      <h3 className="mt-4 font-serif text-2xl text-white">{title}</h3>

      {/* Description with conditional blur */}
      <div className="relative mt-3">
        <p
          className={`text-sm text-white/70 ${isLocked ? 'blur-[2px]' : ''}`}
          data-blur={isLocked}
        >
          {description}
        </p>
        
        {/* Lock icon overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock 
              className="h-6 w-6"
              style={{ color: '#c9a96e', strokeWidth: 1.5 }}
              aria-hidden="true"
              data-lock-icon
            />
          </div>
        )}
      </div>

      {/* Button */}
      <div className="mt-6">
        {buttonAction ? (
          <button
            onClick={buttonAction}
            className="w-full rounded-full px-6 py-3 text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #c9a96e',
              color: '#c9a96e',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(201,169,110,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {buttonLabel}
          </button>
        ) : (
          <Link
            href={buttonHref}
            className="block w-full rounded-full px-6 py-3 text-center text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #c9a96e',
              color: '#c9a96e',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(201,169,110,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {buttonLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function FeatureCards({ access }) {
  const { isMember, discountCode } = access;

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div id="features" className="grid gap-6 md:grid-cols-3">
      {/* Mirror Card - Always Preview */}
      <FeatureCard
        title="The Mirror"
        badge="PREVIEW"
        description="A private reflection and recommendation—quiet, personal, on-brand."
        buttonLabel="Reveal a Reading (Preview)"
        buttonHref="/#mirror"
        isLocked={false}
      />

      {/* Grimoire Card - Locked for visitors */}
      <FeatureCard
        title="Grimoire"
        badge={isMember ? null : 'LOCKED'}
        description="Your saved readings—private, timestamped, and always yours."
        buttonLabel={isMember ? 'Open Grimoire' : 'Join to Unlock'}
        buttonHref={isMember ? '/sanctuary/grimoire' : '/join'}
        isLocked={!isMember}
      />

      {/* Sanctuary Price Card - Locked for visitors */}
      <FeatureCard
        title="Sanctuary Price"
        badge={isMember ? null : 'LOCKED'}
        description={
          isMember
            ? `10% off always—shown on every item. Your code: ${discountCode || 'Loading...'}`
            : '10% off always—shown on every item.'
        }
        buttonLabel={isMember ? 'Copy Code' : 'Join to Unlock'}
        buttonHref={isMember ? null : '/join'}
        buttonAction={isMember ? () => copyToClipboard(discountCode) : null}
        isLocked={!isMember}
      />
    </div>
  );
}
