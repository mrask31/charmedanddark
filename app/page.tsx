'use client';

import { useState } from 'react';
import Link from 'next/link';

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
        {/* 1. HERO: THE MIRROR */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              The world is loud.<br />Your home should be quiet.
            </h1>
            <p className="hero-subtitle">
              Charmed & Dark is a gothic boutique and private Sanctuary<br />
              for the modern shadow.
            </p>

            <div className="mirror">
              <label className="mirror-label">
                Tell the Mirror how your shadow feels right now.
              </label>
              
              {!showReading ? (
                <form onSubmit={handleMirrorSubmit} className="mirror-form">
                  <input
                    type="text"
                    value={feeling}
                    onChange={(e) => setFeeling(e.target.value)}
                    placeholder="I am feeling..."
                    className="mirror-input"
                    autoFocus
                  />
                  <button type="submit" className="mirror-submit">
                    Reflect
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

        {/* 2. THE HOUSE */}
        <section className="house">
          <div className="house-grid">
            <div className="house-card">
              <h2 className="house-card-title">Apparel — The Uniform</h2>
              <p className="house-card-description">
                Quiet silhouettes for those who carry presence without noise.
              </p>
              <Link href="/shop?category=apparel" className="house-card-cta">
                Shop Apparel →
              </Link>
            </div>
            
            <div className="house-card">
              <h2 className="house-card-title">Home Décor — The Ritual</h2>
              <p className="house-card-description">
                Objects that shift the atmosphere of a room.
              </p>
              <Link href="/shop?category=home" className="house-card-cta">
                Shop Home →
              </Link>
            </div>
          </div>
        </section>

        {/* 3. SANCTUARY VALUE */}
        <section className="sanctuary-value">
          <div className="value-grid">
            <div className="value-card">
              <h3 className="value-title">Sanctuary Pricing</h3>
              <p className="value-description">
                10% off always. Two prices appear across the House.
              </p>
            </div>
            
            <div className="value-card">
              <h3 className="value-title">Early Drop Windows</h3>
              <p className="value-description">
                Limited releases arrive quietly. Members enter first.
              </p>
            </div>
            
            <div className="value-card">
              <h3 className="value-title">The Grimoire</h3>
              <p className="value-description">
                Your saved Mirror readings—private and archived.
              </p>
            </div>
          </div>
          
          <div className="value-cta">
            <Link href="/join" className="btn-primary">
              Enter the Sanctuary
            </Link>
            <p className="value-trust">Free to join. No spam. No noise.</p>
          </div>
        </section>

        {/* 4. DROPS */}
        <section className="drops">
          <h2 className="drops-title">Drops</h2>
          <p className="drops-description">
            Limited runs. Quiet releases. Sealed when complete.
          </p>
          
          <div className="drop-card">
            <div className="drop-status">Coming Soon</div>
            <h3 className="drop-name">Winter Sanctuary Collection</h3>
            <Link href="/drops" className="drop-cta">
              View Drops →
            </Link>
          </div>
          
          <p className="drops-note">
            Sanctuary members receive early access.
          </p>
        </section>

        {/* 5. RESONANCE */}
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

        {/* 6. FINAL INVITATION */}
        <section className="final-invitation">
          <h2 className="final-title">
            You don't have to be loud to belong.
          </h2>
          <p className="final-subtitle">Enter when you're ready.</p>
          
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
