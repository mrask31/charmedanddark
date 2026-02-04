'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSanctuary, setIsSanctuary] = useState(false);

  useEffect(() => {
    // Check sanctuary status on mount
    if (typeof window !== 'undefined') {
      setIsSanctuary(localStorage.getItem('sanctuary_preview') === 'true');
    }
  }, []);

  const handleLeaveSanctuary = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sanctuary_preview');
      setIsSanctuary(false);
      window.location.reload();
    }
  };

  return (
    <header className="global-header">
      <div className="header-container">
        <Link href="/" className="header-brand">
          Charmed & Dark
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-nav">
          <Link href="/shop" className="header-link">
            The House
          </Link>
          <Link href="/uniform" className="header-link">
            The Uniform
          </Link>
          <Link href="/join" className="header-link">
            Join
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="mobile-menu">
          <Link 
            href="/shop" 
            className="mobile-menu-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            The House
          </Link>
          <Link 
            href="/uniform" 
            className="mobile-menu-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            The Uniform
          </Link>
          <Link 
            href="/join" 
            className="mobile-menu-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Join
          </Link>
        </nav>
      )}

      {/* Sanctuary Status Indicator */}
      {isSanctuary && (
        <div className="sanctuary-status">
          <span className="sanctuary-status-text">Sanctuary presence active</span>
          <button 
            onClick={handleLeaveSanctuary}
            className="sanctuary-leave-button"
          >
            Leave
          </button>
        </div>
      )}
    </header>
  );
}
