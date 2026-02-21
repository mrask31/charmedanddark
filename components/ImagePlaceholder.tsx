/**
 * Branded placeholder for missing product images
 * Dark grey box with subtle branding
 */

export default function ImagePlaceholder({ title }: { title: string }) {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.logo}>C&D</div>
        <div style={styles.text}>{title}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2d2d2d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  content: {
    textAlign: 'center' as const,
    padding: '2rem',
  },
  logo: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2rem',
    fontWeight: 400,
    letterSpacing: '0.2em',
    color: '#404040',
    marginBottom: '1rem',
  },
  text: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 300,
    letterSpacing: '0.05em',
    color: '#404040',
    textTransform: 'uppercase' as const,
    maxWidth: '200px',
    margin: '0 auto',
    lineHeight: 1.4,
  },
} as const;
