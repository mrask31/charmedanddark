'use client';

import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function HomePage() {
  const [feeling, setFeeling] = useState('');
  const [showReading, setShowReading] = useState(false);

  const handleMirrorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feeling.trim()) {
      setShowReading(true);
      // TODO: Integrate actual Mirror AI experience
    }
  };

  return (
    <>
      <Head>
        <title>Charmed & Dark | Gothic Home Decor & Sanctuary for the Modern Shadow</title>
        <meta name="description" content="Discover gothic home decor, ritual objects, and quiet luxury apparel. Charmed & Dark is a private Sanctuary for those seeking calm, presence, and intentional living." />
      </Head>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <Link href="/" className="nav-brand">Charmed & Dark</Link>
          <div className="nav-links">
            <Link href="/shop">Shop</Link>
            <Link href="/drops">Drops</Link>
            <Link href="/join">Join</Link>
          </div>
        </div>
      </nav>

      <main className="landing">
        {/* SECTION 1: HERO (SEO + Emotional Hook) */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-h1">
              Gothic Home Decor & Quiet Rituals<br />
              for the Modern Sanctuary
            </h1>
            
            <p className="hero-tagline">
              The world is loud. Your home should be quiet.
            </p>
            
            <p className="hero-description">
              Charmed & Dark is a gothic boutique and private Sanctuary offering refined home décor, 
              ritual objects, and understated apparel—designed to bring calm, presence, and atmosphere 
              back into your space.
            </p>

            <div className="hero-ctas">
              <Link href="/join" className="btn-primary">
                Enter the Sanctuary
              </Link>
              <Link href="/shop?category=home" className="btn-secondary">
                Shop Gothic Home Decor
              </Link>
            </div>
            
            <p className="hero-trust">
              Free to join. No spam. No noise.
            </p>
          </div>
        </section>

        {/* SECTION 2: THE MIRROR (Reframed for Clarity) */}
        <section className="mirror-section">
          <div className="mirror-container">
            <h2 className="mirror-headline">The Mirror — A Quiet Recommendation Ritual</h2>
            
            <p className="mirror-description">
              Tell the Mirror how you feel, and receive a private reflection—paired with an object 
              designed to support that mood.
            </p>
            
            <p className="mirror-note">
              No feeds. No performance. Just presence.
            </p>

            <div className="mirror">
              {!showReading ? (
                <form onSubmit={handleMirrorSubmit} className="mirror-form">
                  <input
                    type="text"
                    value={feeling}
                    onChange={(e) => setFeeling(e.target.value)}
                    placeholder="I feel overwhelmed. I need stillness. I want my space to feel calm."
                    className="mirror-input"
                    autoFocus
                  />
                  <button type="submit" className="mirror-submit">
                    Receive Reflection
                  </button>
                </form>
              ) : (
                <div className="reading-card">
                  <div className="reading-validation">
                    <p>The Mirror sees you.</p>
                  </div>
                  
                  <div className="reading-prescription">
                    <p className="reading-product">Recommended: Midnight Candle</p>
                    <p className="reading-ritual">Light it when the noise becomes too much.</p>
                  </div>
                  
                  <div className="reading-resonance">
                    <p>Silence is rising tonight.</p>
                  </div>
                  
                  <div className="reading-actions">
                    <Link href="/join" className="btn-primary">
                      Unlock Sanctuary Price
                    </Link>
                    <Link href="/join" className="btn-secondary">
                      Keep this Reading
                    </Link>
                    <Link href="/shop" className="btn-tertiary">
                      Shop the House
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3: WHAT YOU OFFER (Immediate Clarity) */}
        <section className="house">
          <div className="house-grid">
            <div className="house-card">
              <h2 className="house-card-title">Apparel — The Uniform</h2>
              <p className="house-card-description">
                Quiet silhouettes for those who carry presence without noise. Subtle. Intentional. 
                Designed for daily rituals.
              </p>
              <Link href="/shop?category=apparel" className="house-card-cta">
                Explore Apparel →
              </Link>
            </div>
            
            <div className="house-card">
              <h2 className="house-card-title">Home Décor — The Ritual</h2>
              <p className="house-card-description">
                Objects that shift the atmosphere of a room. Candles, wall art, vessels, and décor 
                designed for calm and intention.
              </p>
              <Link href="/shop?category=home" className="house-card-cta">
                Shop Home Décor →
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 4: WHY JOIN (Conversion Engine) */}
        <section className="sanctuary-value">
          <h2 className="sanctuary-headline">The Sanctuary — Membership Without Noise</h2>
          
          <div className="value-grid">
            <div className="value-card">
              <h3 className="value-title">Sanctuary Pricing</h3>
              <p className="value-description">
                10% off every piece, always. Two prices—members unlock the lower one.
              </p>
            </div>
            
            <div className="value-card">
              <h3 className="value-title">Early Access to Drops</h3>
              <p className="value-description">
                Limited collections released quietly. Members enter first.
              </p>
            </div>
            
            <div className="value-card">
              <h3 className="value-title">The Grimoire</h3>
              <p className="value-description">
                Your saved Mirror reflections—private, timestamped, and personal.
              </p>
            </div>
          </div>
          
          <div className="value-cta">
            <Link href="/join" className="btn-primary">
              Join Free
            </Link>
            <p className="value-trust">Free to join. Purchases optional.</p>
          </div>
        </section>

        {/* SECTION 5: DROPS (Scarcity Without Pressure) */}
        <section className="drops">
          <h2 className="drops-title">Drops</h2>
          <p className="drops-description">
            Limited runs. Quiet releases. Sealed when complete.
          </p>
          
          <div className="drop-card">
            <div className="drop-status">Coming Soon</div>
            <h3 className="drop-name">The Winter Sanctuary Collection opens soon.</h3>
            <Link href="/drops" className="drop-cta">
              View Drops →
            </Link>
          </div>
          
          <p className="drops-note">
            Sanctuary members receive early access.
          </p>
        </section>

        {/* SECTION 6: SOCIAL PROOF (Subtle, Not Cringe) */}
        <section className="resonance">
          <div className="resonance-content">
            <p className="resonance-statement">Some feelings are shared.</p>
            <p className="resonance-statement">Resonance is quiet.</p>
            
            <div className="resonance-rules">
              <span>No comments</span>
              <span>No profiles</span>
              <span>Only presence</span>
            </div>
            
            <Link href="/join" className="btn-secondary">
              Enter the Sanctuary
            </Link>
          </div>
        </section>

        {/* SECTION 7: FINAL CTA (Warm Exit) */}
        <section className="final-invitation">
          <h2 className="final-title">
            You don't have to be loud to belong.
          </h2>
          
          <div className="final-actions">
            <Link href="/join" className="btn-primary">
              Enter the Sanctuary
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
