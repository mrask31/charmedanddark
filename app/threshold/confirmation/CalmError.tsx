/**
 * Calm error component for invalid/expired tokens
 */
export default function CalmError({ message }: { message: string }) {
  return (
    <div style={styles.container}>
      <p style={styles.message}>{message}</p>

      <a href="/threshold" style={styles.backLink}>
        Return to Threshold
      </a>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '96px 24px',
    backgroundColor: '#0A0A0A',
    minHeight: '100vh',
    color: '#E5E5E5',
    textAlign: 'center' as const,
  },
  message: {
    fontSize: '20px',
    marginBottom: '48px',
    color: '#E5E5E5',
  },
  backLink: {
    fontSize: '16px',
    color: '#8B7355', // Muted gold
    textDecoration: 'none',
  },
};
