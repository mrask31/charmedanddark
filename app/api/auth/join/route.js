import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    const { email, firstName, userId, birthday } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId required for membership activation' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // email_subscribers — required write
    const { error: subError } = await supabaseAdmin
      .from('email_subscribers')
      .upsert({
        email: normalizedEmail,
        first_name: firstName || null,
        source: 'sanctuary_join',
        subscribed: true,
        birthday: birthday || null,
      }, { onConflict: 'email' });

    if (subError) {
      console.error('[JOIN] email_subscribers write failed:', subError.message);
      return NextResponse.json({ error: 'Failed to save subscriber record' }, { status: 500 });
    }

    // memberships — required write
    const { error: memError } = await supabaseAdmin
      .from('memberships')
      .upsert({
        user_id: userId,
        status: 'active',
      }, { onConflict: 'user_id' });

    if (memError) {
      console.error('[JOIN] memberships write failed:', memError.message);
      return NextResponse.json({ error: 'Failed to activate membership' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[JOIN] Unexpected error:', err.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
