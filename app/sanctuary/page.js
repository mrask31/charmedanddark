"use client";

import { useSanctuaryAccess } from '@/hooks/useSanctuaryAccess';
import SanctuaryHero from '@/components/sanctuary/SanctuaryHero';
import FeatureCards from '@/components/sanctuary/FeatureCards';
import ResonanceBar from '@/components/sanctuary/ResonanceBar';
import GrimoireSection from '@/components/sanctuary/GrimoireSection';
import StickyJoinBar from '@/components/sanctuary/StickyJoinBar';

export default function SanctuaryPage() {
  const access = useSanctuaryAccess();

  const handleScrollToFeatures = () => {
    const featuresElement = document.getElementById('features');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: '#08080f' }}>
      <SanctuaryHero onScrollClick={handleScrollToFeatures} />
      
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-16">
        <FeatureCards access={access} />
        <ResonanceBar />
        <GrimoireSection access={access} />
      </div>

      <StickyJoinBar access={access} />
    </div>
  );
}
