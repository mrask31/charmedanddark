import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - Charmed & Dark',
  description: 'Elegant gothic apparel and home decor for everyday life',
};

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="container">
        <div className="about-content">
          <h1 className="about-title">About Charmed & Dark</h1>
          
          <div className="about-section">
            <p className="about-text">
              Charmed & Dark creates elegant gothic apparel and home decor for everyday life.
            </p>
            <p className="about-text">
              We believe in pieces that are worn, not performed. Designed with restraint. Built to last.
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-subtitle">Our Approach</h2>
            <p className="about-text">
              Every piece is chosen with intention. No urgency. No pressure. Just quality items that speak for themselves.
            </p>
          </div>

          <div className="about-section">
            <h2 className="about-subtitle">The Collections</h2>
            <p className="about-text">
              Apparel comes first. Home decor follows. The Sanctuary exists separately for those who seek it.
            </p>
          </div>

          <div className="about-cta">
            <Link href="/collections/apparel" className="btn-primary">
              Shop Apparel
            </Link>
            <Link href="/collections/home-decor" className="btn-secondary">
              View Home & Decor
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
