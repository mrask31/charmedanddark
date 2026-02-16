'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo */}
        <Link href="/" className="logo-link">
          <Image
            src="/images/Charmed and Dark Logo.png"
            alt="Charmed & Dark"
            width={180}
            height={45}
            className="logo-desktop"
            priority
          />
          <Image
            src="/images/Charmed and Dark Logo.png"
            alt="Charmed & Dark"
            width={120}
            height={30}
            className="logo-mobile"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <Link href="/collections/apparel" className="nav-link">
            Apparel
          </Link>
          <Link href="/collections/new" className="nav-link">
            New
          </Link>
          <Link href="/shop" className="nav-link">
            Collections
          </Link>
          <Link href="/collections/home-decor" className="nav-link">
            Home & Decor
          </Link>
          <Link href="/mirror" className="nav-link nav-link-sanctuary">
            Sanctuary
          </Link>
          <Link href="/about" className="nav-link">
            About
          </Link>
        </nav>

        {/* Cart Icon */}
        <div className="header-actions">
          <Link href="/cart" className="cart-icon" aria-label="Shopping cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="nav-mobile">
          <Link 
            href="/collections/apparel" 
            className="nav-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Apparel
          </Link>
          <Link 
            href="/collections/new" 
            className="nav-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            New
          </Link>
          <Link 
            href="/shop" 
            className="nav-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Collections
          </Link>
          <Link 
            href="/collections/home-decor" 
            className="nav-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home & Decor
          </Link>
          <Link 
            href="/mirror" 
            className="nav-mobile-link nav-link-sanctuary"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sanctuary
          </Link>
          <Link 
            href="/about" 
            className="nav-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
        </nav>
      )}
    </header>
  );
}
