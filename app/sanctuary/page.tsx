'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import SanctuaryToast from '@/components/SanctuaryToast';

/**
 * Sanctuary Main Page
 * Shows welcome toast for new members
 */
export default function SanctuaryPage() {
  const [showToast, setShowToast] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/sanctuary/enter');
        return;
      }

      setUserEmail(session.user.email || null);

      // Show toast on first visit (check localStorage)
      const hasSeenWelcome = localStorage.getItem('sanctuary_welcome_shown');
      if (!hasSeenWelcome) {
        setShowToast(true);
        localStorage.setItem('sanctuary_welcome_shown', 'true');
      }
    };

    checkAuth();
  }, [router, supabase]);

  return (
    <>
      <SanctuaryToast show={showToast} onClose={() => setShowToast(false)} />
      
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-light mb-8">The Sanctuary</h1>
          {userEmail && (
            <p className="text-gray-400 mb-4">Welcome, {userEmail}</p>
          )}
          <p className="text-sm text-gray-500">Member benefits active</p>
        </div>
      </div>
    </>
  );
}
