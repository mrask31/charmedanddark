import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    const { email, firstName, userId, birthday } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Upsert into email_subscribers (has email column)
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
      console.error('email_subscribers upsert error:', subError.message);
    }

    // Insert into memberships using user_id UUID
    if (userId) {
      const { error: memError } = await supabaseAdmin
        .from('memberships')
        .upsert({
          user_id: userId,
          status: 'active',
        }, { onConflict: 'user_id' });

      if (memError) {
        console.error('memberships insert error:', memError.message);
      }
    } else {
      console.warn('No userId provided for memberships insert');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Join API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
