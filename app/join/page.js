import JoinHero from '@/components/join/JoinHero';
import BenefitsSection from '@/components/join/BenefitsSection';
import HowItWorks from '@/components/join/HowItWorks';
import WhatYouGet from '@/components/join/WhatYouGet';
import FaqSection from '@/components/join/FaqSection';
import JoinCta from '@/components/join/JoinCta';

export const metadata = {
  title: 'Join the Sanctuary | Charmed & Dark — Save 10% Forever',
  description:
    'Step into the Sanctuary at Charmed & Dark to unlock permanent 10% off, early access to Drops, and a private archive of your Mirror readings. Join free in seconds.',
};

export default function JoinPage() {
  return (
    <main style={{ backgroundColor: '#08080f', overflowX: 'hidden' }}>
      <JoinHero />

      <div className="mx-auto max-w-[1280px] px-6">
        <BenefitsSection />
        <HowItWorks />
        <WhatYouGet />
        <FaqSection />
      </div>

      <JoinCta />
    </main>
  );
}
