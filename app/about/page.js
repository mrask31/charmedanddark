import AboutHero from '@/components/about/AboutHero';
import ProseSection from '@/components/about/ProseSection';
import CardsSection from '@/components/about/CardsSection';
import CtaBlock from '@/components/about/CtaBlock';

export const metadata = {
  title: 'About',
  description: 'A boutique for the modern shadow—crafted for quiet, beauty, and ritual.',
};

export default function AboutPage() {
  return (
    <main style={{ backgroundColor: '#08080f', overflowX: 'hidden' }}>
      {/* 1. Hero */}
      <AboutHero />

      {/* 2. Brand Manifesto */}
      <ProseSection
        pullQuote="The world is loud."
        body="We live in a time of constant brightness—endless noise, endless performance, endless demand to be 'fine.' Charmed & Dark was created for those who move through that world, then come home and finally exhale. Not to escape life. To return to yourself."
      />

      {/* 3. What We Create — Two Cards */}
      <CardsSection
        eyebrow="WHAT WE CREATE"
        subtext="Charmed & Dark is an elegant gothic boutique offering two forms of refuge:"
        cards={[
          {
            heading: 'Apparel — The Uniform',
            body: 'Pieces designed for presence. Clean silhouettes. Dark restraint. Comfort that holds its shape. Not costume—identity.',
          },
          {
            heading: 'Home Décor — The Ritual',
            body: 'Objects that shift the atmosphere of a room. Candles. Dark glass. Soft textures. Quiet details. Not clutter—intention.',
          },
        ]}
      />

      {/* 4. Two Realms — Full Width Prose */}
      <ProseSection
        pullQuote="Two realms. One House."
        body={
          <>
            The House is built in two parts:{' '}
            <strong style={{ color: '#e8e4dc', fontWeight: 400 }}>The Threshold</strong>
            {' '}— The public world—where anyone can browse, discover, and shop.{' '}
            <strong style={{ color: '#e8e4dc', fontWeight: 400 }}>The Sanctuary</strong>
            {' '}— A private space for members—calm, personal, and designed to be returned to.
            No noise. No feeds. No performance. Only presence.
          </>
        }
      />

      {/* 5. Features — Three Cards */}
      <CardsSection
        eyebrow="INSIDE THE HOUSE"
        cards={[
          {
            heading: 'The Mirror',
            body: "Our private reflection experience—an elegant gothic companion that responds to your mood with quiet clarity. It isn't here to entertain you. It's here to witness you.",
          },
          {
            heading: 'Drops, sealed in time',
            body: 'Limited runs in small batches—curated capsules of apparel and home décor that arrive quietly and disappear just as cleanly.',
          },
          {
            heading: 'The Sanctuary',
            body: 'A private space for members. Calm. Personal. Designed to be returned to. No noise. No feeds. No performance. Only presence.',
          },
        ]}
      />

      {/* 6. Who The House Is For */}
      <ProseSection
        pullQuote="Who the House is for."
        body="Charmed & Dark is for those who live in two worlds: The polished world people expect. And the private world you protect. For the ones who feel deeply, speak softly, and still carry power. For the modern shadow."
      />

      {/* 7. Closing Invitation */}
      <CtaBlock />
    </main>
  );
}
