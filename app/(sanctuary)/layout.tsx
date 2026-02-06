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
  const [ambience, setAmbience] = useState<AmbienceConfig>(getServerSafeAmbience());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Set initial ambience state
    const updateAmbience = () => {
      const newAmbience = getCurrentAmbienceState();
      setAmbience(newAmbience);
    };

    updateAmbience();

    // Update every minute to check for state changes
    const interval = setInterval(updateAmbience, 60000);

    return () => clearInterval(interval);
  }, []);

  const ambienceClass = isClient ? getAmbienceClassName(ambience) : getAmbienceClassName(getServerSafeAmbience());

  return (
    <div className={`sanctuary-wrapper ${ambienceClass}`}>
      {children}
    </div>
  );
}
