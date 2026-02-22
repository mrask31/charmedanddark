'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { checkAdminAccess, checkAuthenticated } from '@/lib/auth/admin';
import { getSupabaseClient } from '@/lib/supabase/client';

interface AutomatedResult {
  productHandle: string;
  productTitle: string;
  status: 'success' | 'error';
  backgroundType?: string;
  imagesProcessed?: number;
  error?: string;
}

export default function DarkroomPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  
  // Automated mode state
  const [automatedRunning, setAutomatedRunning] = useState(false);
  const [automatedProgress, setAutomatedProgress] = useState<{
    total: number;
    processed: number;
    succeeded: number;
    failed: number;
    currentProduct?: string;
  } | null>(null);
  const [automatedResults, setAutomatedResults] = useState<AutomatedResult[]>([]);

  // Check admin access on mount
  useEffect(() => {
    async function verifyAccess() {
      const isAuthenticated = await checkAuthenticated();
      
      if (!isAuthenticated) {
        router.push('/threshold/enter');
        return;
      }

      const adminEmail = await checkAdminAccess();
      
      if (!adminEmail) {
        router.push('/not-authorized');
        return;
      }

      setAuthChecking(false);
    }

    verifyAccess();
  }, [router]);

  const handleAutomatedRun = async () => {
    setAutomatedRunning(true);
    setAutomatedProgress(null);
    setAutomatedResults([]);

    try {
      // Get auth token
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/darkroom/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit: 20 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to start pipeline');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'progress') {
              setAutomatedProgress({
                total: data.total,
                processed: data.processed,
                succeeded: data.succeeded,
                failed: data.failed,
                currentProduct: data.currentProduct,
              });
            } else if (data.type === 'complete') {
              setAutomatedResults(data.results);
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Automated run error:', error);
      alert(`Pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAutomatedRunning(false);
    }
  };

  // Show loading state while checking auth
  if (authChecking) {
    return (
      <>
        <Header />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.loading}>Verifying access...</div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={styles.main}>
        <div style={styles.container}>
          <header style={styles.header}>
            <h1 style={styles.title}>The Darkroom</h1>
            <p style={styles.subtitle}>Shopify-Driven Image Processing</p>
          </header>

          <section style={styles.automatedSection}>
            <h2 style={styles.sectionTitle}>Automated Processing</h2>
            <p style={styles.sectionDescription}>
              Processes products tagged with:
              <br />
              <code style={styles.code}>img:needs-brand</code> + <code style={styles.code}>source:faire</code> + <code style={styles.code}>dept:objects</code>
            </p>

            <button
              onClick={handleAutomatedRun}
              disabled={automatedRunning}
              style={{
                ...styles.runButton,
                ...(automatedRunning && styles.runButtonDisabled),
              }}
            >
              {automatedRunning ? 'Processing...' : 'Run Darkroom on Tagged Products'}
            </button>

            {automatedProgress && (
              <div style={styles.progressBox}>
                <div style={styles.progressStats}>
                  <span>Progress: {automatedProgress.processed} / {automatedProgress.total}</span>
                  <span style={{ color: '#2d7a2d' }}>✓ {automatedProgress.succeeded}</span>
                  <span style={{ color: '#d32f2f' }}>✗ {automatedProgress.failed}</span>
                </div>
                {automatedProgress.currentProduct && (
                  <p style={styles.currentProduct}>
                    Processing: {automatedProgress.currentProduct}
                  </p>
                )}
              </div>
            )}

            {automatedResults.length > 0 && (
              <div style={styles.resultsSection}>
                <h3 style={styles.resultsTitle}>Results</h3>
                <div style={styles.resultsList}>
                  {automatedResults.map((result, idx) => (
                    <div key={idx} style={styles.resultCard}>
                      <div style={styles.resultHeader}>
                        <span style={styles.resultTitle}>{result.productTitle}</span>
                        <span style={{
                          ...styles.resultStatus,
                          ...(result.status === 'success' && styles.resultStatusSuccess),
                          ...(result.status === 'error' && styles.resultStatusError),
                        }}>
                          {result.status}
                        </span>
                      </div>
                      <p style={styles.resultHandle}>{result.productHandle}</p>
                      {result.status === 'success' && (
                        <p style={styles.resultMeta}>
                          Background: {result.backgroundType} • Images: {result.imagesProcessed}
                        </p>
                      )}
                      {result.error && (
                        <p style={styles.resultError}>{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section style={styles.infoSection}>
            <h2 style={styles.infoTitle}>Pipeline Architecture</h2>
            <ol style={styles.infoList}>
              <li style={styles.infoItem}>
                <strong>Fetch:</strong> Queries Shopify for products with required tags
              </li>
              <li style={styles.infoItem}>
                <strong>AI Selection:</strong> Gemini chooses best background (stone/candle/glass)
              </li>
              <li style={styles.infoItem}>
                <strong>Processing:</strong> RMBG-1.4 removes background, composites onto branded backdrop
              </li>
              <li style={styles.infoItem}>
                <strong>Upload:</strong> Branded images uploaded back to Shopify product
              </li>
              <li style={styles.infoItem}>
                <strong>Tagging:</strong> Adds img:branded + bg:type, removes img:needs-brand
              </li>
            </ol>
          </section>
        </div>
      </main>
    </>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f0',
    paddingTop: '3rem',
    paddingBottom: '4rem',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    color: '#404040',
    letterSpacing: '0.05em',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '4rem',
    paddingTop: '2rem',
  },
  title: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '2.5rem',
    fontWeight: 400,
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 300,
    color: '#404040',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },
  automatedSection: {
    backgroundColor: '#fff',
    border: '1px solid #e8e8e3',
    padding: '3rem',
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: '#1a1a1a',
    marginBottom: '1rem',
  },
  sectionDescription: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    color: '#404040',
    lineHeight: 1.6,
    marginBottom: '2rem',
  },
  code: {
    fontFamily: "'Courier New', monospace",
    fontSize: '0.8rem',
    backgroundColor: '#2d2d2d',
    color: '#f5f5f0',
    padding: '0.2rem 0.4rem',
    marginLeft: '0.25rem',
  },
  runButton: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    color: '#f5f5f0',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  runButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  progressBox: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f5f5f0',
    border: '1px solid #e8e8e3',
  },
  progressStats: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  },
  currentProduct: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.5rem',
  },
  resultsSection: {
    marginTop: '2rem',
  },
  resultsTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: '#1a1a1a',
    marginBottom: '1rem',
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  resultCard: {
    padding: '1rem',
    backgroundColor: '#f5f5f0',
    border: '1px solid #e8e8e3',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  resultTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1a1a1a',
  },
  resultStatus: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 400,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#404040',
  },
  resultStatusSuccess: {
    color: '#2d7a2d',
  },
  resultStatusError: {
    color: '#d32f2f',
  },
  resultHandle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    color: '#666',
    marginBottom: '0.25rem',
  },
  resultMeta: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    color: '#404040',
  },
  resultError: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    color: '#d32f2f',
    marginTop: '0.5rem',
  },
  infoSection: {
    backgroundColor: '#2d2d2d',
    padding: '2rem',
    color: '#f5f5f0',
  },
  infoTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    marginBottom: '1.5rem',
  },
  infoList: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    lineHeight: 1.8,
    paddingLeft: '1.5rem',
  },
  infoItem: {
    marginBottom: '0.75rem',
  },
} as const;
