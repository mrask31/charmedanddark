import { NextResponse } from "next/server";

const KLAVIYO_API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
const SANCTUARY_LIST_ID = process.env.KLAVIYO_SANCTUARY_LIST_ID;

export async function POST(request) {
  try {
    const { userId, email, firstName } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    if (!KLAVIYO_API_KEY || !SANCTUARY_LIST_ID) {
      console.error("Klaviyo env vars not configured");
      return NextResponse.json({ error: "Service not configured" }, { status: 503 });
    }

    // Create or update profile with sanctuary membership info
    const profileRes = await fetch("https://a.klaviyo.com/api/profile-import/", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        "Content-Type": "application/json",
        revision: "2024-02-15",
      },
      body: JSON.stringify({
        data: {
          type: "profile",
          attributes: {
            email: email.toLowerCase().trim(),
            first_name: firstName || undefined,
            properties: {
              sanctuary_member: true,
              sanctuary_joined: new Date().toISOString(),
              supabase_user_id: userId || undefined,
            },
          },
        },
      }),
    });

    if (!profileRes.ok) {
      const err = await profileRes.text();
      console.error("Klaviyo profile create failed:", err);
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    const profileData = await profileRes.json();
    const profileId = profileData.data?.id;

    if (!profileId) {
      return NextResponse.json({ error: "No profile ID returned" }, { status: 500 });
    }

    // Add profile to Sanctuary Members list
    const listRes = await fetch(
      `https://a.klaviyo.com/api/lists/${SANCTUARY_LIST_ID}/relationships/profiles/`,
      {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
          "Content-Type": "application/json",
          revision: "2024-02-15",
        },
        body: JSON.stringify({
          data: [{ type: "profile", id: profileId }],
        }),
      }
    );

    if (!listRes.ok) {
      const err = await listRes.text();
      console.error("Klaviyo sanctuary list add failed:", err);
      return NextResponse.json({ error: "Failed to add to sanctuary list" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Klaviyo sanctuary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
