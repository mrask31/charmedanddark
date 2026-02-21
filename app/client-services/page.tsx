'use client';

import Header from '@/components/Header';

export default function ClientServicesPage() {
  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <article style={styles.article}>
            <h1 style={styles.title}>Client Services</h1>
            
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Shipping</h2>
              <p style={styles.text}>
                All orders are processed within 2-3 business days. Domestic shipments 
                arrive within 5-7 business days. International delivery times vary by 
                region.
              </p>
              <p style={styles.text}>
                Tracking information is provided upon dispatch.
              </p>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Returns</h2>
              <p style={styles.text}>
                Unworn apparel may be returned within 30 days of delivery. Physical 
                objects are final sale unless damaged in transit.
              </p>
              <p style={styles.text}>
                Contact us to initiate a return. Original packaging is required.
              </p>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Material Care</h2>
              <p style={styles.text}>
                <strong>Apparel:</strong> Cold wash. Hang dry. Iron on low heat if necessary. 
                Do not bleach. Our garments are designed to age with dignity—minor fading 
                and softening is intentional.
              </p>
              <p style={styles.text}>
                <strong>Cast Iron:</strong> Hand wash only. Dry immediately. Apply thin coat 
                of oil after each use. Do not use soap.
              </p>
              <p style={styles.text}>
                <strong>Ceramic & Stoneware:</strong> Hand wash recommended. Dishwasher safe 
                on gentle cycle. Avoid thermal shock.
              </p>
              <p style={styles.text}>
                <strong>Brass & Metal:</strong> Patina is natural and desired. To maintain 
                original finish, polish with brass cleaner. To encourage patina, leave 
                untreated.
              </p>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Contact</h2>
              <p style={styles.text}>
                For inquiries regarding orders, products, or collaborations, contact us 
                at <a href="mailto:house@charmedanddark.com" style={styles.link}>house@charmedanddark.com</a>
              </p>
              <p style={styles.text}>
                Response time: 24-48 hours.
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
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 400,
    letterSpacing: '0.05em',
    color: '#1a1a1a',
    marginBottom: '4rem',
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: '3rem',
    paddingBottom: '3rem',
    borderBottom: '1px solid #e8e8e3',
  },
  sectionTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: '#1a1a1a',
    marginBottom: '1.5rem',
  },
  text: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    fontWeight: 300,
    letterSpacing: '0.02em',
    lineHeight: 1.8,
    color: '#1a1a1a',
    marginBottom: '1rem',
  },
  link: {
    color: '#1a1a1a',
    textDecoration: 'underline',
    textDecorationColor: '#404040',
    transition: 'text-decoration-color 0.2s',
  },
} as const;
