import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const body = await request.json()
    const { mood, mode = 'self' } = body

    if (!mood || mood.trim().length === 0) {
      return NextResponse.json({ error: 'Mood is required' }, { status: 400 })
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

    if (!ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY')
      return NextResponse.json({
        validation: 'The mirror is quiet tonight.',
        prescription: 'Return when the mood finds words.',
        products: [],
      })
    }

    let productList = []
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      const { data } = await supabase
        .from('products')
        .select('title, handle, price, category')
        .or('hidden.is.null,hidden.eq.false')
        .limit(30)

      if (data && data.length > 0) {
        productList = data.sort(() => Math.random() - 0.5).slice(0, 12)
      }
    } catch (err) {
      console.error('Supabase product fetch error:', err)
    }

    const productContext = productList.length > 0
      ? `\n\nAvailable products:\n${productList.map(p => `- "${p.title}" (${p.category}, $${p.price}, handle: ${p.handle})`).join('\n')}`
      : ''

    const selfSystemPrompt = `You are The Mirror — a quiet, poetic oracle for Charmed & Dark, a gothic lifestyle brand.
When someone describes their mood, respond with exactly three things:
1. VALIDATION: 1-2 sentences acknowledging their feeling in elegant, dark, atmospheric prose. Never use the word "valid". Speak as if you understand them deeply.
2. PRESCRIPTION: 1 evocative sentence suggesting a ritual or aesthetic that matches their energy.
3. PRODUCTS: Choose the single most mood-appropriate product from the list. Return it as an array with one object.
${productContext}
Respond ONLY with a raw JSON object. No markdown, no code fences, no preamble. Just the JSON.
Format: {"validation":"string","prescription":"string","products":[{"title":"exact product title","handle":"exact handle","price":"price string","reason":"one sentence why this fits their mood"}]}`

    const giftSystemPrompt = `You are The Mirror — a quiet, poetic gift guide for Charmed & Dark, a gothic lifestyle brand.
Someone is shopping for a friend. Based on their description of the person, recommend 2-3 products that would suit them.
For each product, write one evocative sentence explaining why it fits this person specifically.
Also write a brief atmospheric intro (1-2 sentences) acknowledging who this person sounds like.
${productContext}
Respond ONLY with a raw JSON object. No markdown, no code fences, no preamble. Just the JSON.
Format: {"validation":"string — poetic description of who this person is","prescription":"string — one line about their aesthetic","products":[{"title":"exact product title","handle":"exact handle","price":"price string","reason":"one sentence why this fits them"}]}`

    const systemPrompt = mode === 'gift' ? giftSystemPrompt : selfSystemPrompt

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: 'user', content: mood.trim().slice(0, 300) }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Anthropic API error:', response.status, errText)
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    let text = data.content?.[0]?.text || ''
    text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch (parseErr) {
      console.error('JSON parse failed. Raw text:', text)
      parsed = null
    }

    return NextResponse.json({
      validation: parsed?.validation || 'The mirror sees you.',
      prescription: parsed?.prescription || 'Light a candle. Let the dark hold you for a moment.',
      products: parsed?.products || [],
      mode,
    })
  } catch (err) {
    console.error('Mirror route error:', err)
    return NextResponse.json({
      validation: 'The mirror is quiet tonight.',
      prescription: 'Return when the mood finds words.',
      products: [],
    })
  }
}
