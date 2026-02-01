'use client';

/**
 * Calm retry component
 * No aggressive polling - manual retry only
 */
export default function CalmRetry() {
  function handleRetry() {
    // Reload page to retry
    window.location.reload();
  }

  return (
    <div style={styles.container}>
      <p style={styles.message}>
        We're preparing your confirmation. This can take a moment.
      </p>

      <div style={styles.actions}>
        <button onClick={handleRetry} style={styles.retryButton}>
          Retry
        </button>
        <a href="/threshold" style={styles.backLink}>
          Back to Threshold
        </a>
      </div>
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
  actions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#0A0A0A',
    color: '#8B7355', // Muted gold
    border: '1px solid #8B7355',
    padding: '16px 48px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  backLink: {
    fontSize: '16px',
    color: '#8B7355',
    textDecoration: 'none',
  },
};
