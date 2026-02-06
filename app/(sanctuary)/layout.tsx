'use client';

import { useEffect, useState } from 'react';
import { 
  getCurrentAmbienceState, 
  getAmbienceClassName,
  getServerSafeAmbience,
  type AmbienceConfig 
} from '@/lib/sanctuary/ambience';

export default function SanctuaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize with server-safe default to prevent hydration mismatch
  const [ambience, setAmbience] = useState<AmbienceConfig>(getServerSafeAmbience());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Reconcile to local time only once after hydration
    const updateAmbience = () => {
      const newAmbience = getCurrentAmbienceState();
      setAmbience(newAmbience);
    };

    // Initial update on mount
    updateAmbience();
    setMounted(true);

    // Update every minute to check for state changes
    const interval = setInterval(updateAmbience, 60000);

    return () => clearInterval(interval);
  }, []);

  // Always use the same class on server and initial client render to prevent flash
  const ambienceClass = getAmbienceClassName(ambience);

  return (
    <div 
      className={`sanctuary-wrapper ${ambienceClass}`}
      style={{
        // Smooth transition when ambience state changes (300-500ms per spec)
        transition: mounted ? 'background 400ms ease-in-out' : 'none'
      }}
    >
      {children}
    </div>
  );
}
