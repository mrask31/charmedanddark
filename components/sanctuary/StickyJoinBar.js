import Link from 'next/link';

export default function StickyJoinBar({ access }) {
  const { isAuthenticated, isMember } = access;

  // Hide bar entirely if user is a member
  if (isMember) {
    return null;
  }

  const buttonText = isAuthenticated ? 'Upgrade to Member' : 'JOIN FREE';
  const description = isAuthenticated
    ? 'Unlock all sanctuary features with membership'
    : 'Join free to unlock The Grimoire and Sanctuary Price';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur"
      style={{
        backgroundColor: 'rgba(8,8,15,0.92)',
        borderTop: '1px solid #c9a96e',
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <p className="text-sm text-white/70">{description}</p>
        <Link
          href="/join"
          className="whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #c9a96e',
            color: '#c9a96e',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(201,169,110,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}
