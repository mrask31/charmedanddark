'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function JoinPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      
      // Insert into sanctuary_signups (upsert to handle duplicates gracefully)
      const { error: insertError } = await supabase
        .from('sanctuary_signups')
        .upsert(
          { email: email.toLowerCase().trim(), source: 'join' },
          { onConflict: 'email' }
        );

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        setError('Something went quiet. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Set sanctuary status in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('sanctuary_preview', 'true');
      }

      // Redirect to previous page or shop
      const referrer = typeof window !== 'undefined' ? document.referrer : '';
      if (referrer && referrer.includes(window.location.host)) {
        router.back();
      } else {
        router.push('/shop');
      }
    } catch (err) {
      console.error('Join error:', err);
      setError('Something went quiet. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="join-page">
      <div className="join-container">
        <div className="join-content">
          <h1 className="join-title">Enter the Sanctuary</h1>
          
          <p className="join-intro">
            The Sanctuary is a quiet inner space.<br />
            Those who enter are recognized — not rewarded.
          </p>

          <div className="join-benefits">
            <div className="join-benefit">
              <h3 className="join-benefit-title">Always 10% recognition pricing</h3>
            </div>
            <div className="join-benefit">
              <h3 className="join-benefit-title">Early access to seasonal Drops</h3>
            </div>
            <div className="join-benefit">
              <h3 className="join-benefit-title">Private reflections with The Mirror (coming soon)</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="join-form">
            <div className="join-form-field">
              <label htmlFor="email" className="join-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="join-input"
                placeholder="your@email.com"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="join-error">{error}</p>
            )}

            <button
              type="submit"
              className="join-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entering...' : 'Enter the Sanctuary'}
            </button>

            <p className="join-helper">
              We'll only write when something returns.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
