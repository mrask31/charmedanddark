'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';

interface Message {
  role: 'user' | 'curator';
  content: string;
  productHandle?: string;
  productTitle?: string;
}

export default function SanctuaryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/threshold/enter');
        return;
      }
      
      setUser(user);
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsThinking(true);

    try {
      const response = await fetch('/api/sanctuary/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add curator response
      setMessages(prev => [
        ...prev,
        {
          role: 'curator',
          content: data.response,
          productHandle: data.recommendedProduct?.handle,
          productTitle: data.recommendedProduct?.title,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'curator',
          content: 'The Curator is momentarily unavailable. Please try again.',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingText}>Entering...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Minimal exit link */}
      <Link href="/" style={styles.exit}>
        ← Exit
      </Link>

      {/* Chat area */}
      <div style={styles.chatArea}>
        {messages.length === 0 ? (
          <div style={styles.welcome}>
            <p style={styles.welcomeText}>The Curator listens.</p>
            <p style={styles.welcomeHint}>Share a thought, mood, or feeling.</p>
          </div>
        ) : (
          <div style={styles.messages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={msg.role === 'user' ? styles.userMessage : styles.curatorMessage}
              >
                <div style={styles.messageContent}>{msg.content}</div>
                {msg.productHandle && (
                  <Link
                    href={`/product/${msg.productHandle}`}
                    style={styles.productLink}
                  >
                    View {msg.productTitle} →
                  </Link>
                )}
              </div>
            ))}
            {isThinking && (
              <div style={styles.thinking}>
                <span style={styles.thinkingDot}>.</span>
                <span style={styles.thinkingDot}>.</span>
                <span style={styles.thinkingDot}>.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
          style={styles.input}
          autoFocus
          disabled={isThinking}
        />
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#e8e8e3',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: "'Inter', sans-serif",
  },
  loading: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#e8e8e3',
    fontSize: '0.875rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
  },
  exit: {
    position: 'absolute' as const,
    top: '2rem',
    left: '2rem',
    color: '#666',
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    transition: 'color 0.2s',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    padding: '4rem 2rem 2rem',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  welcome: {
    textAlign: 'center' as const,
  },
  welcomeText: {
    fontSize: '1.5rem',
    fontWeight: 300,
    letterSpacing: '0.05em',
    marginBottom: '1rem',
    color: '#e8e8e3',
  },
  welcomeHint: {
    fontSize: '0.875rem',
    color: '#666',
    letterSpacing: '0.05em',
  },
  messages: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
  },
  userMessage: {
    alignSelf: 'flex-end' as const,
    maxWidth: '70%',
  },
  curatorMessage: {
    alignSelf: 'flex-start' as const,
    maxWidth: '70%',
  },
  messageContent: {
    fontSize: '1rem',
    lineHeight: 1.7,
    letterSpacing: '0.02em',
    marginBottom: '0.75rem',
  },
  productLink: {
    display: 'inline-block',
    fontSize: '0.875rem',
    color: '#e8e8e3',
    borderBottom: '1px solid #666',
    letterSpacing: '0.05em',
    transition: 'border-color 0.2s',
  },
  thinking: {
    alignSelf: 'flex-start' as const,
    display: 'flex',
    gap: '0.5rem',
  },
  thinkingDot: {
    fontSize: '1.5rem',
    color: '#666',
    animation: 'pulse 1.5s infinite',
  },
  inputForm: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  input: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '1px solid #333',
    color: '#e8e8e3',
    fontSize: '1rem',
    padding: '1rem 0',
    outline: 'none',
    fontFamily: "'Inter', sans-serif",
    letterSpacing: '0.02em',
    transition: 'border-color 0.2s',
  },
} as const;
