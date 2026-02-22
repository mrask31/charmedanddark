'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { checkAdminAccess, checkAuthenticated } from '@/lib/auth/admin';

interface ProcessingJob {
  id: string;
  productHandle: string;
  productTitle: string;
  status: 'pending' | 'extracting' | 'generating' | 'compositing' | 'uploading' | 'complete' | 'error';
  error?: string;
  imageUrls?: string[];
  imageCount?: number;
}

export default function DarkroomPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [authChecking, setAuthChecking] = useState(true);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);
    setJobs([]);

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const response = await fetch('/api/admin/darkroom/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || 'Processing failed');
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
            setJobs(prev => {
              const index = prev.findIndex(j => j.id === data.id);
              if (index >= 0) {
                const updated = [...prev];
                updated[index] = data;
                return updated;
              }
              return [...prev, data];
            });
          }
        }
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check that your CSV has the required columns: product_handle, image_url`);
    } finally {
      setProcessing(false);
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
            <p style={styles.subtitle}>Automated Image Processing Pipeline</p>
          </header>

          <section style={styles.uploadSection}>
            <div style={styles.uploadZone}>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={styles.fileInput}
                id="csv-upload"
              />
              <label htmlFor="csv-upload" style={styles.uploadLabel}>
                {file ? file.name : 'Select CSV File'}
              </label>
              <p style={styles.uploadHint}>
                Required columns: product_handle, image_1, image_2, image_3, image_4 (or more)
                <br />
                <a href="/darkroom-template.csv" download style={styles.templateLink}>
                  Download CSV Template →
                </a>
              </p>
            </div>

            <button
              onClick={handleProcess}
              disabled={!file || processing}
              style={{
                ...styles.processButton,
                ...((!file || processing) && styles.processButtonDisabled),
              }}
            >
              {processing ? 'Processing...' : 'Process Images'}
            </button>
          </section>

          {jobs.length > 0 && (
            <section style={styles.jobsSection}>
              <h2 style={styles.jobsTitle}>Processing Queue</h2>
              <div style={styles.jobsList}>
                {jobs.map((job) => (
                  <div key={job.id} style={styles.jobCard}>
                    <div style={styles.jobHeader}>
                      <h3 style={styles.jobTitle}>{job.productTitle}</h3>
                      <span style={{
                        ...styles.jobStatus,
                        ...(job.status === 'complete' && styles.jobStatusComplete),
                        ...(job.status === 'error' && styles.jobStatusError),
                      }}>
                        {job.status}
                      </span>
                    </div>
                    <p style={styles.jobHandle}>
                      {job.productHandle}
                      {job.imageCount && ` • ${job.imageCount} image${job.imageCount > 1 ? 's' : ''}`}
                    </p>
                    {job.error && (
                      <p style={styles.jobError}>{job.error}</p>
                    )}
                    {job.imageUrls && job.imageUrls.length > 0 && (
                      <div style={styles.jobImages}>
                        {job.imageUrls.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={styles.jobLink}>
                            Image {idx + 1} →
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section style={styles.infoSection}>
            <h2 style={styles.infoTitle}>Pipeline Architecture</h2>
            <ol style={styles.infoList}>
              <li style={styles.infoItem}>
                <strong>Extraction:</strong> RMBG-1.4 removes background, preserves product pixels
              </li>
              <li style={styles.infoItem}>
                <strong>Environment:</strong> Generate branded brutalist backdrop separately
              </li>
              <li style={styles.infoItem}>
                <strong>Compositing:</strong> Layer product over background with drop shadows
              </li>
              <li style={styles.infoItem}>
                <strong>Sync:</strong> Upload to Supabase Storage, update database
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
  uploadSection: {
    backgroundColor: '#fff',
    border: '1px solid #e8e8e3',
    padding: '3rem',
    marginBottom: '3rem',
  },
  uploadZone: {
    marginBottom: '2rem',
  },
  fileInput: {
    display: 'none',
  },
  uploadLabel: {
    display: 'block',
    padding: '2rem',
    border: '2px dashed #2d2d2d',
    textAlign: 'center' as const,
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    color: '#404040',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  uploadHint: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    color: '#666',
    textAlign: 'center' as const,
    marginTop: '1rem',
    lineHeight: 1.6,
  },
  templateLink: {
    color: '#1a1a1a',
    textDecoration: 'underline',
    fontWeight: 500,
  },
  processButton: {
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
  processButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  jobsSection: {
    marginBottom: '3rem',
  },
  jobsTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: '#1a1a1a',
    marginBottom: '1.5rem',
  },
  jobsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  jobCard: {
    backgroundColor: '#fff',
    border: '1px solid #e8e8e3',
    padding: '1.5rem',
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  jobTitle: {
    fontFamily: "'Crimson Pro', serif",
    fontSize: '1.125rem',
    fontWeight: 400,
    color: '#1a1a1a',
  },
  jobStatus: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    fontWeight: 400,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#404040',
  },
  jobStatusComplete: {
    color: '#2d7a2d',
  },
  jobStatusError: {
    color: '#d32f2f',
  },
  jobHandle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  jobError: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    color: '#d32f2f',
    marginTop: '0.5rem',
  },
  jobLink: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    color: '#1a1a1a',
    textDecoration: 'underline',
    marginTop: '0.5rem',
    display: 'inline-block',
    marginRight: '1rem',
  },
  jobImages: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginTop: '0.75rem',
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
