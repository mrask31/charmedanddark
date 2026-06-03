'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

if (
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  window.location.hostname === 'www.charmedanddark.com' &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
    session_recording: {
      maskAllInputs: false,
      maskTextSelector: "[name='password'], [type='password']",
    },
  });
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', { '$current_url': url });
    }
  }, [pathname, searchParams]);

  return null;
}

function getPostHogUserProperties(user) {
  return {
    email: user.email,
    source: 'supabase',
    is_sanctuary_member: user.user_metadata?.is_sanctuary_member === true,
  };
}

export function PHProvider({ children }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    let lastIdentifiedUserId = null;

    function identifyUser(user, source) {
      if (!user?.id) return;
      posthog.identify(user.id, getPostHogUserProperties(user));
      if (lastIdentifiedUserId !== user.id) {
        posthog.capture('user_identified', {
          source,
          is_sanctuary_member: user.user_metadata?.is_sanctuary_member === true,
        });
        lastIdentifiedUserId = user.id;
      }
    }

    // Identify users who already have an active Supabase session on page load.
    // onAuthStateChange alone can miss already-signed-in users, which leaves
    // PostHog sessions anonymous until a fresh sign-in event occurs.
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) identifyUser(session.user, 'initial_session');
      })
      .catch((err) => console.warn('[POSTHOG] Failed to read initial Supabase session:', err?.message));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        posthog.reset();
        lastIdentifiedUserId = null;
        return;
      }
      if (session?.user) {
        identifyUser(session.user, event?.toLowerCase() || 'auth_state_change');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  );
}

// Export posthog instance for custom event tracking
export { posthog };
