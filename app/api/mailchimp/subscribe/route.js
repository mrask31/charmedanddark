import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * POST /api/mailchimp/subscribe
 *
 * Accepts { email } in JSON body.
 * Routes to Mailchimp if configured, otherwise falls back to Supabase drop_alerts table.
 * Mailchimp env vars are server-only (no NEXT_PUBLIC_ prefix):
 *   - MAILCHIMP_API_KEY
 *   - MAILCHIMP_SERVER_PREFIX
 *   - MAILCHIMP_DROP_ALERTS_LIST_ID
 */
export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate email format
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for Mailchimp configuration (server-only env vars)
    const mailchimpKey = process.env.MAILCHIMP_API_KEY;
    const mailchimpServer = process.env.MAILCHIMP_SERVER_PREFIX;
    const mailchimpListId = process.env.MAILCHIMP_DROP_ALERTS_LIST_ID;
    const mailchimpConfigured = !!(mailchimpKey && mailchimpServer && mailchimpListId);

    // Try Mailchimp first if configured
    if (mailchimpConfigured) {
      try {
        const mcResponse = await fetch(
          `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`,
          {
            method: 'POST',
            headers: {
              Authorization: `apikey ${mailchimpKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email_address: normalizedEmail,
              status: 'subscribed',
              tags: ['drop-alerts'],
            }),
          }
        );

        if (mcResponse.ok) {
          return NextResponse.json({ success: true, provider: 'mailchimp' });
        }

        // 400 from Mailchimp typically means already subscribed — treat as success
        if (mcResponse.status === 400) {
          return NextResponse.json({ success: true, provider: 'mailchimp' });
        }

        // Any other error — fall through to Supabase
        const mcError = await mcResponse.text();
        console.error('Mailchimp API error, falling back to Supabase:', mcError);
      } catch (err) {
        console.error('Mailchimp request failed, falling back to Supabase:', err.message);
      }
    }

    // Supabase fallback (or primary when Mailchimp is not configured)
    return await insertDropAlert(normalizedEmail);
  } catch (err) {
    console.error('Subscribe route error:', err);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

/**
 * Insert email into Supabase drop_alerts table.
 * Handles duplicate emails gracefully (treats as success).
 */
async function insertDropAlert(email) {
  const { error } = await supabaseAdmin
    .from('drop_alerts')
    .insert({ email });

  if (error) {
    // Postgres unique violation = duplicate email — treat as success
    if (error.code === '23505') {
      return NextResponse.json({ success: true, provider: 'supabase' });
    }
    console.error('Supabase drop_alerts insert failed:', error.message);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }

  return NextResponse.json({ success: true, provider: 'supabase' });
}

/**
 * Basic email format validation.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
