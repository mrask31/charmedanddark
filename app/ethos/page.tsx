'use client';

import Header from '@/components/Header';

export default function EthosPage() {
  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <article style={styles.article}>
            <h1 style={styles.title}>The Ethos</h1>
            
            <section style={styles.section}>
              <p style={styles.paragraph}>
                We dictate silhouette before we dictate space. Charmed & Dark constructs 
                premium, restrained apparel designed for permanence, accompanied by a 
                curated collection of heavy, physical objects to anchor your home.
              </p>
            </section>

            <section style={styles.section}>
              <h2 style={styles.subtitle}>On Restraint</h2>
              <p style={styles.paragraph}>
                Every object we select, every garment we design, exists to hold space 
                without demanding attention. We reject the ephemeral. We reject the 
                disposable. We build for those who understand that atmosphere is 
                architecture, and architecture is intention.
              </p>
            </section>

            <section style={styles.section}>
              <h2 style={styles.subtitle}>On Permanence</h2>
              <p style={styles.paragraph}>
                Our apparel is constructed to outlast trends. Heavy fabrics. Reinforced 
                seams. Matte finishes that age with dignity. These are not seasonal 
                pieces—they are foundational elements of a wardrobe built to endure.
              </p>
            </section>

            <section style={styles.section}>
              <h2 style={styles.subtitle}>On Objects</h2>
              <p style={styles.paragraph}>
                The objects we curate are selected for their weight, their presence, 
                their ability to transform a room through sheer material honesty. Cast 
                iron. Matte ceramic. Unpolished brass. These are not decorations—they 
                are anchors.
              </p>
            </section>

            <section style={styles.section}>
              <h2 style={styles.subtitle}>The House</h2>
              <p style={styles.paragraph}>
                Charmed & Dark is not a brand. It is a house. A philosophy. A commitment 
                to the quiet power of restraint. We do not chase attention. We do not 
                follow trends. We build spaces—physical and sartorial—that hold their 
                ground.
              </p>
              <p style={styles.paragraph}>
                Enter with intention. Leave with permanence.
              </p>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f0',
    paddingTop: '4rem',
    paddingBottom: '6rem',
  },
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  article: {
    paddingTop: '4rem',
  },
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 400,
    letterSpacing: '0.05em',
    color: '#1a1a1a',
    marginBottom: '4rem',
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: '4rem',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    fontWeight: 400,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: '#1a1a1a',
    marginBottom: '1.5rem',
  },
  paragraph: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.125rem',
    fontWeight: 300,
    letterSpacing: '0.02em',
    lineHeight: 1.9,
    color: '#1a1a1a',
    marginBottom: '1.5rem',
  },
} as const;
