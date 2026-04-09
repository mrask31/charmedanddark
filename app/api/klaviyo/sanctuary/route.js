import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, firstName, birthday } = await request.json();

    const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
    const listId = process.env.KLAVIYO_SANCTUARY_LIST_ID || 'WTaWTH';

    console.log('[KLAVIYO] Starting with key prefix:', apiKey?.substring(0, 8));
    console.log('[KLAVIYO] List ID:', listId);
    console.log('[KLAVIYO] Email:', email);
    console.log('[KLAVIYO] Birthday:', birthday);
    console.log('[KLAVIYO] FirstName:', firstName);

    // Step 1: Create profile
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
            ...(birthday ? { Birthday: birthday } : {}),
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
    console.log('[KLAVIYO] Profile response:', profileText.substring(0, 300));

    let profileId;

    if (profileRes.status === 201 || profileRes.status === 200) {
      const profileData = JSON.parse(profileText);
      profileId = profileData.data?.id;
      console.log('[KLAVIYO] New profile created:', profileId);
    } else if (profileRes.status === 409) {
      const profileData = JSON.parse(profileText);
      profileId = profileData.errors?.[0]?.meta?.duplicate_profile_id;
      console.log('[KLAVIYO] Existing profile ID:', profileId);
    } else {
      console.error('[KLAVIYO] Profile creation failed:', profileRes.status, profileText);
      return NextResponse.json({ success: false, error: 'Profile creation failed' });
    }

    if (!profileId) {
      console.error('[KLAVIYO] No profile ID obtained');
      return NextResponse.json({ success: false, error: 'No profile ID' });
    }

    // Step 2: ALWAYS update profile with properties (handles both new and existing)
    console.log('[KLAVIYO] Starting PATCH for profile:', profileId);
    const updatePayload = {
      data: {
        type: 'profile',
        id: profileId,
        attributes: {
          first_name: firstName || undefined,
          properties: {
            sanctuary_member: true,
            source: 'sanctuary-join',
            signup_date: new Date().toISOString(),
            ...(birthday ? { Birthday: birthday } : {}),
          },
        },
      },
    };
    console.log('[KLAVIYO] PATCH payload:', JSON.stringify(updatePayload));

    try {
      const updateRes = await fetch(`https://a.klaviyo.com/api/profiles/${profileId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Klaviyo-API-Key ${apiKey}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
        body: JSON.stringify(updatePayload),
      });
      const updateText = await updateRes.text();
      console.log('[KLAVIYO] PATCH status:', updateRes.status);
      console.log('[KLAVIYO] PATCH response:', updateText.substring(0, 300));
    } catch (patchErr) {
      console.error('[KLAVIYO] PATCH exception:', patchErr.message);
    }

    // Step 3: Subscribe to list
    console.log('[KLAVIYO] Starting subscription for list:', listId);
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
                    marketing: { consent: 'SUBSCRIBED' },
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

    try {
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
      console.log('[KLAVIYO] Subscribe response:', subText.substring(0, 300));
    } catch (subErr) {
      console.error('[KLAVIYO] Subscribe exception:', subErr.message);
    }

    console.log('[KLAVIYO] All done for:', email);
    return NextResponse.json({ success: true, profileId });
  } catch (error) {
    console.error('[KLAVIYO] Exception:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
