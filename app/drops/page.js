"use client";

import DropsHero from '@/components/drops/DropsHero';
import NextDrop from '@/components/drops/NextDrop';
import MembershipBenefits from '@/components/drops/MembershipBenefits';
import DropAlertBand from '@/components/drops/DropAlertBand';
import DropsArchive from '@/components/drops/DropsArchive';
import DropsStickBar from '@/components/drops/DropsStickBar';

export default function DropsPage() {
  const handleScrollToSection = (sectionId) => {
    const HEADER_HEIGHT = 80;
    const element = document.getElementById(sectionId);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: '#08080f', overflowX: 'hidden', paddingBottom: '80px' }}>
      {/* Skip to content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:px-6 focus:py-3 focus:text-sm focus:font-medium"
        style={{
          backgroundColor: '#c9a96e',
          color: '#08080f',
        }}
      >
        Skip to main content
      </a>

      <DropsHero
        onScrollToSignup={() => handleScrollToSection('membership-signup')}
        onScrollToAlerts={() => handleScrollToSection('drop-alerts')}
      />

      <main id="main-content" className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
        <NextDrop />
        <MembershipBenefits />
      </main>

      <DropAlertBand />

      <aside className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
        <DropsArchive />
      </aside>

      <DropsStickBar onJoinClick={() => handleScrollToSection('membership-signup')} />
    </div>
  );
}
