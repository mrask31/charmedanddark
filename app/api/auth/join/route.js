import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[JOIN] SERVICE_ROLE_KEY missing!');
  }

  try {
    const { email, firstName, userId, birthday } = await request.json();
    console.log('[JOIN] Route called with:', { email, firstName, userId, birthday });

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Upsert into email_subscribers
    try {
      const { error } = await supabaseAdmin
        .from('email_subscribers')
        .upsert({
          email: normalizedEmail,
          first_name: firstName || null,
          source: 'sanctuary_join',
          subscribed: true,
          birthday: birthday || null,
        }, { onConflict: 'email' });

      if (error) console.error('[JOIN] email_subscribers error:', error);
      else console.log('[JOIN] email_subscribers saved for:', normalizedEmail);
    } catch (e) {
      console.error('[JOIN] email_subscribers exception:', e.message);
    }

    // Insert into memberships using user_id UUID
    if (userId) {
      try {
        const { error } = await supabaseAdmin
          .from('memberships')
          .upsert({
            user_id: userId,
            status: 'active',
          }, { onConflict: 'user_id' });

        if (error) console.error('[JOIN] memberships error:', error);
        else console.log('[JOIN] memberships saved for userId:', userId);
      } catch (e) {
        console.error('[JOIN] memberships exception:', e.message);
      }
    } else {
      console.warn('[JOIN] No userId provided for memberships insert');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[JOIN] Route error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
