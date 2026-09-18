import { supabaseAdmin } from '@/lib/supabase/admin';
import { POST as subscribeToKlaviyo } from '@/app/api/klaviyo/subscribe/route';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, source, utm_campaign, utm_source, utm_medium, consent } = await request.json();

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (consent !== true) {
      return NextResponse.json({ error: 'Please agree to receive marketing emails.' }, { status: 400 });
    }
    // Wait for the provider to accept the request; never report a dropped background job as success.
    const providerResponse = await subscribeToKlaviyo(new Request('https://internal.invalid/api/klaviyo/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: source || 'website', consent: true }),
    }));
    if (!providerResponse.ok) return providerResponse;

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

    if (error) console.error('Subscriber audit storage failed:', error.code);

    return NextResponse.json({ success: true, alreadySubscribed: alreadyExists });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
