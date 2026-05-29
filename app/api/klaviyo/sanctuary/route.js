import { NextResponse } from 'next/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,63}$/;

export async function POST(request) {
  try {
    const { email, firstName, birthday } = await request.json();

    if (!email || !EMAIL_REGEX.test(String(email).trim().toLowerCase())) {
      return NextResponse.json({ error: 'Please enter a complete email address.' }, { status: 400 });
    }

    const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
    const listId = process.env.KLAVIYO_SANCTUARY_LIST_ID || 'WTaWTH';

    if (!apiKey) {
      console.error('[KLAVIYO] KLAVIYO_PRIVATE_API_KEY not configured');
      return NextResponse.json({ error: 'The Sanctuary is not accepting entries right now. Please try again shortly.' }, { status: 500 });
    }

    // Format birthday as YYYY-MM-DD with placeholder year
    let klaviyoBirthday = null;
    if (birthday && birthday.includes('/')) {
      const [mm, dd] = birthday.split('/');
      klaviyoBirthday = `1900-${mm}-${dd}`;
    }

    // Step 1: Create/update Klaviyo profile
    const profilePayload = {
      data: {
        type: 'profile',
        attributes: {
          email,
          first_name: firstName || '',
          properties: {
            sanctuary_member: true,
            source: 'sanctuary-join',
            signup_date: new Date().toISOString(),
            ...(klaviyoBirthday ? { Birthday: klaviyoBirthday } : {}),
          },
        },
      },
    };

    const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify(profilePayload),
    });

    const profileText = await profileRes.text();
    let profileId;

    if (profileRes.status === 201 || profileRes.status === 200) {
      const profileData = JSON.parse(profileText);
      profileId = profileData.data?.id;
    } else if (profileRes.status === 409) {
      const profileData = JSON.parse(profileText);
      profileId = profileData.errors?.[0]?.meta?.duplicate_profile_id;
    } else {
      console.error('[KLAVIYO] Profile creation failed:', profileRes.status);
      return NextResponse.json({ error: 'We could not complete your Sanctuary entry. Please check your email and try again.' }, { status: 502 });
    }

    if (!profileId) {
      console.error('[KLAVIYO] No profile ID obtained');
      return NextResponse.json({ error: 'We could not complete your Sanctuary entry. Please check your email and try again.' }, { status: 502 });
    }

    // Step 2: Update profile properties (ensures data is set for existing profiles)
    const updateRes = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          id: profileId,
          attributes: {
            first_name: firstName || undefined,
            properties: {
              sanctuary_member: true,
              source: 'sanctuary-join',
              signup_date: new Date().toISOString(),
              ...(klaviyoBirthday ? { Birthday: klaviyoBirthday } : {}),
            },
          },
        },
      }),
    });

    if (!updateRes.ok) {
      const updateText = await updateRes.text().catch(() => '');
      console.error('[KLAVIYO] Profile update failed:', updateRes.status, updateText.substring(0, 300));
      return NextResponse.json({ error: 'We could not complete your Sanctuary entry right now. Please try again.' }, { status: 502 });
    }

    // Step 3: Subscribe to Sanctuary list — required
    const subRes = await fetch(
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify({
          data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
              profiles: {
                data: [{
                  type: 'profile',
                  attributes: {
                    email,
                    subscriptions: {
                      email: { marketing: { consent: 'SUBSCRIBED' } },
                    },
                  },
                }],
              },
            },
            relationships: {
              list: { data: { type: 'list', id: listId } },
            },
          },
        }),
      }
    );

    if (!subRes.ok && subRes.status !== 202) {
      console.error('[KLAVIYO] List subscription failed:', subRes.status);
      return NextResponse.json({ error: 'We could not complete your Sanctuary entry right now. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ success: true, profileId });
  } catch (error) {
    console.error('[KLAVIYO] Unexpected error:', error.message);
    return NextResponse.json({ error: 'Something went quiet. Please try again.' }, { status: 500 });
  }
}
