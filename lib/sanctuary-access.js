export const DEFAULT_SANCTUARY_ACCESS = {
  isAuthenticated: false, isMember: false, discountCode: null, grimoire: null, loading: true,
};

export function isActiveSanctuaryMembership(membership, now = Date.now()) {
  return membership?.status === 'active'
    && (!membership.expires_at || new Date(membership.expires_at).getTime() > now);
}

/** UI membership only. Cart routes independently verify the bearer token and membership. */
export function observeSanctuaryAccess(client, publish) {
  let disposed = false;
  let generation = 0;
  let timer;
  let currentUserId = null;

  async function checkAccess(session, request) {
    const commit = (value) => {
      if (!disposed && request === generation) publish(value);
    };
    const guest = { ...DEFAULT_SANCTUARY_ACCESS, loading: false };
    try {
      if (session === undefined) {
        const result = await client.auth.getSession();
        if (result.error) throw result.error;
        session = result.data.session;
      }
      if (disposed || request !== generation) return;
      const userId = session?.user?.id;
      if (!userId) { currentUserId = null; commit(guest); return; }
      currentUserId = userId;
      const signedIn = { ...guest, isAuthenticated: true };
      const { data: membership, error } = await client.from('memberships')
        .select('status, expires_at').eq('user_id', userId).eq('status', 'active').maybeSingle();
      if (disposed || request !== generation) return;
      if (error || !isActiveSanctuaryMembership(membership)) { commit(signedIn); return; }

      // Show the verified member price without waiting for unrelated account content.
      commit({ ...signedIn, isMember: true });
      const results = await Promise.allSettled([
        client.from('grimoire_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
        client.from('discount_codes').select('code').eq('user_id', userId).eq('is_active', true).maybeSingle(),
      ]);
      const [grimoire, discount] = results.map(result => result.status === 'fulfilled' ? result.value : { error: true });
      commit({ ...signedIn, isMember: true, grimoire: grimoire.error ? null : grimoire.data,
        discountCode: discount.error ? null : discount.data?.code || null });
    } catch {
      commit(guest);
    }
  }

  function refresh(session) {
    if (disposed) return;
    const request = ++generation;
    clearTimeout(timer);
    if (session !== undefined && session?.user?.id !== currentUserId) {
      currentUserId = session?.user?.id || null;
      publish({ ...DEFAULT_SANCTUARY_ACCESS, isAuthenticated: !!currentUserId, loading: !!currentUserId });
    }
    // Never await Supabase calls within its auth callback (the auth lock is still held).
    timer = setTimeout(() => checkAccess(session, request), 0);
  }

  // INITIAL_SESSION also performs the first check; sign-in/out and token refresh recheck it.
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => refresh(session));
  return {
    refresh: () => refresh(undefined),
    dispose: () => { disposed = true; generation += 1; clearTimeout(timer); subscription.unsubscribe(); },
  };
}
