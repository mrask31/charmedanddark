// Validate required environment variables
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Missing required environment variable: ANTHROPIC_API_KEY');
}

export async function generateProductLore(product) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are the voice of Charmed & Dark, a premium gothic lifestyle brand. Write SEO-rich product descriptions that balance atmosphere with discoverability.

VOICE RULES:
- Write in second person ("you") to draw the reader in
- Evoke ritual, quiet darkness, candlelight, midnight, and stillness
- Never use exclamation marks. Never sound enthusiastic or salesy
- Never use the words "unique," "stunning," "amazing," "perfect," or "beautiful"
- Avoid clichés. No "one of a kind" or "must have" or "treat yourself"
- Total length: 60-100 words (strict limit for SEO)
- Include the branded product name naturally in the first sentence
- Weave in material, color, and key features within the prose
- The tone is gothic, intimate, and deliberate

RESPONSE FORMAT:
Return ONLY valid JSON with this structure:
{
  "lore": "Your atmospheric description here (60-100 words)"
}`,
      messages: [
        {
          role: 'user',
          content: `Write a product description for this item:

Name: ${product.name}
Category: ${product.category || 'Gothic Home Decor'}
Original Description: ${product.description || 'No description available'}
Price: $${product.sale_price || product.price}

Return ONLY valid JSON with the format: {"lore": "your 60-100 word description"}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const loreText = data.content[0]?.text || null;
  
  // Parse JSON response
  if (loreText) {
    try {
      const parsed = JSON.parse(loreText);
      return parsed.lore || loreText;
    } catch {
      // Fallback if Claude returns plain text instead of JSON
      return loreText;
    }
  }
  
  return null;
}
