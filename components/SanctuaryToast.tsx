'use client';

import { useEffect, useState } from 'react';

/**
 * Sanctuary Welcome Toast
 * Monospace, tracked-out confirmation message
 */

interface SanctuaryToastProps {
  show: boolean;
  onClose: () => void;
}

export default function SanctuaryToast({ show, onClose }: SanctuaryToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Fade in
      setTimeout(() => setIsVisible(true), 100);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-black border border-white px-8 py-4 shadow-2xl">
        <p className="text-white text-xs font-mono uppercase tracking-widest whitespace-nowrap">
          Sanctuary Status Active. 10% Member Pricing Applied.
        </p>
      </div>
    </div>
  );
}
