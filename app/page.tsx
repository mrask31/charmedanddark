'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { initializeSectionReveals } from './utils/sectionReveal';

export default function HomePage() {
  // Initialize section reveal observer
  useEffect(() => {
    const cleanup = initializeSectionReveals();
    return cleanup;
  }, []);

  return (
    <>
      <Head>
        <title>Charmed & Dark | Gothic Home Decor & Sanctuary for the Modern Shadow</title>
        <meta name="description" content="Discover gothic home decor, ritual objects, and quiet luxury apparel. Charmed & Dark is a private Sanctuary for those seeking calm, presence, and intentional living." />
      </Head>

      <main className="landing">
        {/* SECTION 1: HERO (Emotional Hook + SEO) */}
        <section className="hero">
          <div className="hero-background">
            <img 
              src="/images/dark hair female burning sage with crystal candles.png" 
              alt="Atmospheric ritual scene"
            />
          </div>
          <div className="hero-content">
            <h1 className="hero-h1">
              The world is loud.<br />
              You don't have to be.
            </h1>
            
            <p className="hero-description">
              An elegant gothic lifestyle. Refined objects, understated apparel, and ritual essentials 
              for those seeking calm, presence, and atmosphere in everyday living.
            </p>

            <div className="hero-ctas">
              <Link href="/join" className="btn-primary">
                Enter the Sanctuary
              </Link>
              <Link href="/shop" className="btn-secondary">
                Shop the House
              </Link>
            </div>
            
            <p className="hero-trust">
              Free to join. No spam. No noise.
            </p>
          </div>
        </section>

        {/* SECTION 2: THE MIRROR */}
        <section className="mirror-section">
          <div className="mirror-container">
            <h2 className="mirror-headline">The Mirror</h2>
            
            <p className="mirror-description">
              Your mood. Your object. The Mirror recommends what you need.
            </p>
            
            <p className="mirror-note">
              Not random. Not a feed. Just you and the recommendation.
            </p>

            <div className="mirror-preview">
              <p className="mirror-preview-text">
                The Mirror is a private place to pause. It reflects without fixing.
              </p>
              <p className="mirror-preview-examples">
                "I feel overwhelmed" · "I need stillness" · "I want my space to feel calm"
              </p>
              <Link href="/mirror" className="mirror-preview-cta">
                Enter The Mirror →
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE HOUSE */}
        <section className="house">
          <div className="house-intro">
            <h2 className="house-intro-title">The House</h2>
            <p className="house-intro-description">
              What we make. What you wear. What fills your space.
            </p>
          </div>
          
          <div className="house-grid">
            <div className="house-card" tabIndex={0}>
              <div className="house-card-image">
                <img 
                  src="/images/Dark-haired woman with tattoos wearing a black 'Charmed and Dark' t-shirt with a small chest logo against a dark patterned wallpaper background..png" 
                  alt="Charmed & Dark apparel - black t-shirt"
                />
              </div>
              <h2 className="house-card-title">The Uniform</h2>
              <p className="house-card-description">
                T-shirts, hoodies, and layers designed to disappear. No logos. No noise. Just black.
              </p>
              <Link href="/uniform" className="house-card-cta">
                See the Collection →
              </Link>
            </div>
            
            <div className="house-card" tabIndex={0}>
              <div className="house-card-image">
                <img 
                  src="/images/BEST trinket dish, table top mirror, and sage.png" 
                  alt="Charmed & Dark objects - trinket dish, mirror, and sage"
                />
              </div>
              <h2 className="house-card-title">Objects</h2>
              <p className="house-card-description">
                Candles that burn clean. Mirrors that reflect intention. Objects that make a room feel different.
              </p>
              <Link href="/shop?category=home" className="house-card-cta">
                Explore Objects →
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 4: JOIN THE SANCTUARY */}
        <section className="sanctuary-value">
          <h2 className="sanctuary-headline">Join Free. Save Always.</h2>
          <p className="sanctuary-subhead">
            Sanctuary membership costs nothing. Gives you everything.
          </p>
          
          <div className="value-grid">
            <div className="value-card" tabIndex={0}>
              <h3 className="value-title">Sanctuary Pricing</h3>
              <p className="value-description">
                10% off every purchase, forever. No codes. No expiration.
              </p>
            </div>
            
            <div className="value-card" tabIndex={0}>
              <h3 className="value-title">Early Access</h3>
              <p className="value-description">
                Enter Drops first. Before anyone else.
              </p>
            </div>
            
            <div className="value-card" tabIndex={0}>
              <h3 className="value-title">The Grimoire</h3>
              <p className="value-description">
                Your Mirror readings, saved. Private and permanent.
              </p>
            </div>
          </div>
          
          <div className="value-cta">
            <Link href="/join" className="btn-primary">
              Join the Sanctuary
            </Link>
            <p className="value-trust">Free forever. Purchases optional.</p>
          </div>
        </section>

        {/* SECTION 5: DROPS */}
        <section className="drops">
          <h2 className="drops-title">Drops</h2>
          <p className="drops-description">
            Limited runs. Quiet releases. Gone when sold out.
          </p>
          
          <div className="drop-card" tabIndex={0}>
            <div className="drop-card-image">
              <img 
                src="/images/Black and Gold Stars on real wall set up - BEST.png" 
                alt="Black and gold star wall art"
              />
            </div>
            <div className="drop-card-content">
              <div className="drop-status">Coming Soon</div>
              <h3 className="drop-name">The Winter Sanctuary Collection</h3>
              <Link href="/drops" className="drop-cta">
                View Drops →
              </Link>
            </div>
          </div>
          
          <p className="drops-note">
            Members enter first.
          </p>
        </section>

        {/* SECTION 6: FINAL CTA */}
        <section className="final-invitation">
          <h2 className="final-title">
            You belong here.
          </h2>
          
          <div className="final-actions">
            <Link href="/join" className="btn-primary">
              Join the Sanctuary
            </Link>
            <Link href="/shop" className="btn-secondary">
              Shop the House
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Not loud. Not viral. Enduring.</p>
      </footer>
    </>
  );
}
