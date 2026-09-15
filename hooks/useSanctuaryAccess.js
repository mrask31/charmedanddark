import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_SANCTUARY_ACCESS, observeSanctuaryAccess } from '@/lib/sanctuary-access';

export function useSanctuaryAccess() {
  const { supabase } = useAuth();
  const [access, setAccess] = useState(DEFAULT_SANCTUARY_ACCESS);

  useEffect(() => {
    const observer = observeSanctuaryAccess(supabase, setAccess);
    window.addEventListener('sanctuary-membership-updated', observer.refresh);
    return () => {
      observer.dispose();
      window.removeEventListener('sanctuary-membership-updated', observer.refresh);
    };
  }, [supabase]);

  return access;
}
