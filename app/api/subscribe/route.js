import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, source, utm_campaign, utm_source, utm_medium } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('email_subscribers')
      .select('email')
      .eq('email', normalizedEmail)
      .single();

    const alreadyExists = !!existing;

    const { error } = await supabaseAdmin
      .from('email_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          source: source || 'unknown',
          utm_campaign: utm_campaign || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
        },
        { onConflict: 'email' }
      );

    if (error) throw error;

    // Also send to Klaviyo (fire-and-forget, don't block the response)
    try {
      const klaviyoUrl = new URL('/api/klaviyo/subscribe', request.url);
      fetch(klaviyoUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          source: source || 'website',
        }),
      }).catch((err) => console.error('Klaviyo sync failed:', err.message));
    } catch (klaviyoErr) {
      console.error('Klaviyo call setup failed:', klaviyoErr.message);
    }

    return NextResponse.json({ success: true, alreadySubscribed: alreadyExists });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
