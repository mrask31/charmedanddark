import Link from 'next/link';

export default function HeroIdentity() {
  return (
    <section className="hero-identity">
      <div className="hero-identity-content">
        <h1 className="hero-identity-headline">
          Charmed & Dark<br />
          Made to be worn.
        </h1>
        
        <p className="hero-identity-subtext">
          Not costume. Not aesthetic. Everyday pieces for people who live comfortably in darker tones.
        </p>
        
        <p className="hero-identity-supporting">
          Clothing that feels like recognition, not attention.
        </p>
        
        <div className="hero-identity-actions">
          <Link href="/collections/apparel" className="btn-primary-hero">
            Wear it daily
          </Link>
          <Link href="/collections/apparel" className="btn-secondary-hero">
            View all pieces
          </Link>
        </div>
      </div>
    </section>
  );
}
