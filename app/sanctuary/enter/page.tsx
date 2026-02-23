'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Sanctuary Gate - High-end Login/Signup Flow
 * Monochromatic Brutalism aesthetic
 */
export default function SanctuaryEnterPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              sanctuary_member: true,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Trigger Edge Function to create Shopify customer
          await fetch('/api/sanctuary/sync-customer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: data.user.id, email }),
          });

          router.push('/sanctuary');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push('/sanctuary');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-light tracking-wider mb-2">
            THE SANCTUARY
          </h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            Members Only
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex border border-gray-800 mb-8">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 text-sm uppercase tracking-wider transition-colors ${
              mode === 'signin'
                ? 'bg-white text-black'
                : 'bg-black text-gray-500 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-sm uppercase tracking-wider transition-colors ${
              mode === 'signup'
                ? 'bg-white text-black'
                : 'bg-black text-gray-500 hover:text-white'
            }`}
          >
            Join
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-gray-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-black border border-gray-800 px-4 py-3 text-white focus:border-white focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm border border-red-900 bg-red-950/20 px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 text-sm uppercase tracking-wider font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : mode === 'signin' ? 'Enter' : 'Join Sanctuary'}
          </button>
        </form>

        {/* Benefits */}
        {mode === 'signup' && (
          <div className="mt-12 pt-8 border-t border-gray-900">
            <p className="text-xs uppercase tracking-widest text-gray-600 mb-4">
              Member Benefits
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>• 10% discount on all objects</li>
              <li>• Early access to new collections</li>
              <li>• Curator's insights and notes</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
