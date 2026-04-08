import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, firstName, birthday } = await request.json();

    const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
    const listId = process.env.KLAVIYO_SANCTUARY_LIST_ID || 'WTaWTH';

    console.log('[KLAVIYO] Starting with key prefix:', apiKey?.substring(0, 8));
    console.log('[KLAVIYO] List ID:', listId);
    console.log('[KLAVIYO] Email:', email);

    // Step 1: Create/update profile (no subscriptions in attributes)
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
            ...(birthday && { Birthday: birthday }),
          },
        },
      },
    };

    console.log('[KLAVIYO] Profile payload:', JSON.stringify(profilePayload));

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
    console.log('[KLAVIYO] Profile status:', profileRes.status);
    console.log('[KLAVIYO] Profile response:', profileText);

    let profileId;

    if (profileRes.status === 201 || profileRes.status === 200) {
      const profileData = JSON.parse(profileText);
      profileId = profileData.data?.id;
    } else if (profileRes.status === 409) {
      const profileData = JSON.parse(profileText);
      profileId = profileData.errors?.[0]?.meta?.duplicate_profile_id;
      console.log('[KLAVIYO] Existing profile ID:', profileId);
    } else {
      console.error('[KLAVIYO] Profile creation failed:', profileText);
      return NextResponse.json({ success: false, error: profileText });
    }

    if (!profileId) {
      console.error('[KLAVIYO] No profile ID obtained');
      return NextResponse.json({ success: false, error: 'No profile ID' });
    }

    // Step 2: Subscribe profile to list via bulk subscription endpoint
    const subscribePayload = {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [{
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
              },
            }],
          },
        },
        relationships: {
          list: {
            data: { type: 'list', id: listId },
          },
        },
      },
    };

    console.log('[KLAVIYO] Subscribe payload:', JSON.stringify(subscribePayload));

    const subRes = await fetch(
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify(subscribePayload),
      }
    );

    const subText = await subRes.text();
    console.log('[KLAVIYO] Subscribe status:', subRes.status);
    console.log('[KLAVIYO] Subscribe response:', subText);

    return NextResponse.json({ success: true, profileId });
  } catch (error) {
    console.error('[KLAVIYO] Exception:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
