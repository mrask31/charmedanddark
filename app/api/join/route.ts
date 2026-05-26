import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

type JoinRequestBody = {
  email?: string;
  source?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIMEOUT_MS = 8000;

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function subscribeToKlaviyo(email: string) {
  const privateKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  const sanctuaryListId = process.env.KLAVIYO_SANCTUARY_LIST_ID;

  if (!privateKey || !sanctuaryListId) {
    console.warn('Klaviyo join skipped: missing KLAVIYO_PRIVATE_API_KEY or KLAVIYO_SANCTUARY_LIST_ID');
    return { skipped: true };
  }

  const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
    method: 'POST',
    headers: {
      Authorization: `Klaviyo-API-Key ${privateKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      revision: '2024-10-15',
    },
    body: JSON.stringify({
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email,
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: 'SUBSCRIBED',
                      },
                    },
                  },
                  properties: {
                    sanctuary_member: true,
                    signup_source: 'join',
                  },
                },
              },
            ],
          },
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: sanctuaryListId,
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const responseText = await response.text().catch(() => 'Unable to read Klaviyo error body');
    throw new Error(`Klaviyo subscription failed: ${response.status} ${responseText}`);
  }

  return { skipped: false };
}

export async function POST(request: NextRequest) {
  let body: JoinRequestBody;

  try {
    body = await request.json();
  } catch {
    return json(400, {
      ok: false,
      code: 'INVALID_JSON',
      message: 'The form could not be read. Please refresh and try again.',
    });
  }

  const email = body.email?.toLowerCase().trim();

  if (!email) {
    return json(400, {
      ok: false,
      code: 'EMAIL_REQUIRED',
      message: 'Please enter your email address.',
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    return json(400, {
      ok: false,
      code: 'EMAIL_INVALID',
      message: 'Please enter a valid email address.',
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Join failed: missing Supabase environment variables');
    return json(500, {
      ok: false,
      code: 'SERVER_CONFIG_ERROR',
      message: 'The Sanctuary is not accepting entries right now. Please try again shortly.',
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const { error: signupError } = await withTimeout(
      supabase
        .from('sanctuary_signups')
        .upsert(
          {
            email,
            source: body.source || 'join',
          },
          { onConflict: 'email' }
        ),
      'Supabase sanctuary_signups upsert'
    );

    if (signupError) {
      console.error('Join Supabase signup error:', signupError);
      return json(500, {
        ok: false,
        code: 'SIGNUP_SAVE_FAILED',
        message: 'We could not save your Sanctuary entry. Please try again.',
      });
    }

    const { error: membershipError } = await withTimeout(
      supabase
        .from('memberships')
        .upsert(
          {
            email,
            status: 'active',
            source: body.source || 'join',
          },
          { onConflict: 'email' }
        ),
      'Supabase memberships upsert'
    );

    if (membershipError) {
      console.warn('Join memberships upsert warning:', membershipError);
    }

    try {
      await withTimeout(subscribeToKlaviyo(email), 'Klaviyo subscription');
    } catch (klaviyoError) {
      console.error('Join Klaviyo error:', klaviyoError);
      return json(502, {
        ok: false,
        code: 'EMAIL_SUBSCRIBE_FAILED',
        message: 'Your entry was saved, but email confirmation failed. Please try again so we can complete your Sanctuary access.',
      });
    }

    return json(200, {
      ok: true,
      email,
      message: 'You are in. Recognition pricing is now unlocked on this device.',
    });
  } catch (error) {
    console.error('Join API unexpected error:', error);
    return json(500, {
      ok: false,
      code: 'JOIN_UNEXPECTED_ERROR',
      message: 'Something went quiet. Please try again.',
    });
  }
}
