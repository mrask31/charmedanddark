import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { mood } = body

    if (!mood || mood.trim().length === 0) {
      return NextResponse.json({ error: 'Mood is required' }, { status: 400 })
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

    if (!ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY')
      return NextResponse.json({
        validation: 'The mirror is quiet tonight.',
        prescription: 'Return when the mood finds words.',
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `You are The Mirror — a quiet, poetic oracle for Charmed & Dark, a gothic lifestyle brand.
When someone describes their mood, respond with exactly two things:
1. A VALIDATION: 1-2 sentences acknowledging their feeling in elegant, dark, atmospheric prose. Never use the word "valid". Speak as if you understand them deeply.
2. A PRESCRIPTION: 1 sentence suggesting a ritual, object, or aesthetic that matches their energy. Keep it evocative and tied to gothic/dark home/lifestyle themes — candles, darkness, quiet rituals, dark clothing, sacred objects.
Respond ONLY with valid JSON. No preamble, no markdown. Format: { "validation": "string", "prescription": "string" }
Be poetic, not clinical. Be dark, not scary. Be warm, not corporate.`,
        messages: [{ role: 'user', content: mood.trim().slice(0, 200) }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = {
        validation: 'The mirror sees you.',
        prescription: 'Light a candle. Let the dark hold you for a moment.',
      }
    }

    return NextResponse.json({
      validation: parsed.validation || 'The mirror sees you.',
      prescription: parsed.prescription || 'Light a candle tonight.',
    })
  } catch (err) {
    console.error('Mirror route error:', err)
    return NextResponse.json({
      validation: 'The mirror is quiet tonight.',
      prescription: 'Return when the mood finds words.',
    })
  }
}
