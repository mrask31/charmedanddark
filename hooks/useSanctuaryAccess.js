import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

const DEFAULT_STATE = {
  isAuthenticated: false,
  isMember: false,
  discountCode: null,
  grimoire: null,
  loading: true,
};

export function useSanctuaryAccess() {
  const [access, setAccess] = useState(DEFAULT_STATE);

  useEffect(() => {
    async function checkAccess() {
      try {
        // Step 1: Check for active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Sanctuary auth check failed:', sessionError);
          setAccess({ ...DEFAULT_STATE, loading: false });
          return;
        }

        if (!session) {
          setAccess({ ...DEFAULT_STATE, loading: false });
          return;
        }

        const userId = session.user.id;

        // Step 2: Check for active membership
        const { data: membership, error: membershipError } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (membershipError || !membership) {
          if (membershipError && membershipError.code !== 'PGRST116') {
            // PGRST116 = no rows returned (expected for non-members)
            console.error('Membership query failed:', membershipError);
          }
          setAccess({
            isAuthenticated: true,
            isMember: false,
            discountCode: null,
            grimoire: null,
            loading: false,
          });
          return;
        }

        // Step 3: Fetch member-only data in parallel
        const [grimoireResult, discountResult] = await Promise.all([
          supabase
            .from('grimoire_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(3),
          supabase
            .from('discount_codes')
            .select('code')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single(),
        ]);

        // Handle grimoire fetch errors gracefully
        const grimoire = grimoireResult.error 
          ? null 
          : grimoireResult.data;

        if (grimoireResult.error) {
          console.error('Grimoire fetch failed:', grimoireResult.error);
        }

        // Handle discount code fetch errors gracefully
        const discountCode = discountResult.error 
          ? null 
          : discountResult.data?.code || null;

        if (discountResult.error && discountResult.error.code !== 'PGRST116') {
          console.error('Discount code fetch failed:', discountResult.error);
        }

        setAccess({
          isAuthenticated: true,
          isMember: true,
          discountCode,
          grimoire,
          loading: false,
        });
      } catch (error) {
        console.error('Unexpected error in useSanctuaryAccess:', error);
        setAccess({ ...DEFAULT_STATE, loading: false });
      }
    }

    checkAccess();
  }, []);

  return access;
}
