import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, source } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const KLAVIYO_PRIVATE_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY
    const KLAVIYO_SANCTUARY_LIST_ID = process.env.KLAVIYO_SANCTUARY_LIST_ID

    if (!KLAVIYO_PRIVATE_API_KEY || !KLAVIYO_SANCTUARY_LIST_ID) {
      console.error('Missing Klaviyo env vars')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Step 1: Create or update profile in Klaviyo
    const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_API_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email,
            first_name: body.firstName || undefined,
            properties: {
              sanctuary_member: true,
              source: source || 'join-page',
              signup_date: new Date().toISOString(),
              joined_at: new Date().toISOString(),
            },
            subscriptions: {
              email: {
                marketing: {
                  consent: 'SUBSCRIBED',
                },
              },
            },
          },
        },
      }),
    })

    let profileId
    if (profileRes.status === 201) {
      const profileData = await profileRes.json()
      profileId = profileData.data.id
    } else if (profileRes.status === 409) {
      // Profile already exists — get the ID from the conflict response
      const conflictData = await profileRes.json()
      profileId = conflictData?.errors?.[0]?.meta?.duplicate_profile_id
      if (!profileId) {
        // Search for the profile by email
        const searchRes = await fetch(
          `https://a.klaviyo.com/api/profiles/?filter=equals(email,"${encodeURIComponent(email)}")`,
          {
            headers: {
              'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_API_KEY}`,
              'revision': '2024-02-15',
            },
          }
        )
        const searchData = await searchRes.json()
        profileId = searchData?.data?.[0]?.id
      }
    } else {
      const errText = await profileRes.text()
      console.error('Klaviyo profile creation failed:', profileRes.status, errText)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    if (!profileId) {
      console.error('Could not determine profile ID')
      return NextResponse.json({ error: 'Profile ID not found' }, { status: 500 })
    }

    // Check if already in Sanctuary Members list
    const memberCheckRes = await fetch(
      `https://a.klaviyo.com/api/lists/${KLAVIYO_SANCTUARY_LIST_ID}/relationships/profiles/`,
      {
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_API_KEY}`,
          'Content-Type': 'application/json',
          'revision': '2024-02-15',
        },
      }
    )
    const memberCheckData = await memberCheckRes.json()
    const alreadyMember = memberCheckData?.data?.some(p => p.id === profileId) || false

    if (alreadyMember) {
      return NextResponse.json({ success: true, alreadyMember: true })
    }

    // Step 2: Add profile to Sanctuary Members list
    const listRes = await fetch(`https://a.klaviyo.com/api/lists/${KLAVIYO_SANCTUARY_LIST_ID}/relationships/profiles/`, {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_API_KEY}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
      body: JSON.stringify({
        data: [{ type: 'profile', id: profileId }],
      }),
    })

    if (!listRes.ok && listRes.status !== 204) {
      const errText = await listRes.text()
      console.error('Failed to add to sanctuary list:', listRes.status, errText)
      return NextResponse.json({ error: 'Failed to add to list' }, { status: 500 })
    }

    return NextResponse.json({ success: true, profileId })
  } catch (err) {
    console.error('Sanctuary route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
