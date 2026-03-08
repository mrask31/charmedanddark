import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, source, utm_campaign, utm_source, utm_medium } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('email_subscribers')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          source: source || 'unknown',
          utm_campaign: utm_campaign || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
        },
        { onConflict: 'email' }
      );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return NextResponse.json({ error: 'Subscription failed' }, { status: 500 });
  }
}
