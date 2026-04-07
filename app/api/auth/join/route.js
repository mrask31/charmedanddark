import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Upsert into email_subscribers
    const { error: subError } = await supabaseAdmin
      .from('email_subscribers')
      .upsert({
        email: normalizedEmail,
        first_name: firstName || null,
        source: 'sanctuary_join',
        subscribed: true,
      }, { onConflict: 'email' });

    if (subError) {
      console.error('email_subscribers upsert error:', subError.message);
    }

    // Insert into memberships
    const { error: memError } = await supabaseAdmin
      .from('memberships')
      .upsert({
        email: normalizedEmail,
        first_name: firstName || null,
        joined_at: new Date().toISOString(),
        status: 'active',
      }, { onConflict: 'email' });

    if (memError) {
      console.error('memberships insert error:', memError.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Join API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
