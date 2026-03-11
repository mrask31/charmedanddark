// Validate required environment variables
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Missing required environment variable: ANTHROPIC_API_KEY');
}

export async function generateProductContent(product) {
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
      system: `You are the voice of Charmed & Dark, a premium gothic lifestyle brand. Create branded product names and SEO-rich descriptions.

NAMING RULES:
- Transform generic supplier names into evocative branded names
- Use "The" prefix for singular items (The Midnight Veil Throw)
- Use descriptive gothic phrases (Catacomb Scholar, Obsidian Ritual, Veilbound)
- Include the core product type (Bookends, Candle, Throw Blanket)
- Keep names under 60 characters
- Examples: "The Catacomb Scholar — Aged Skull Bookend Set", "The Obsidian Ritual — Black Rose Candle Holder"

DESCRIPTION RULES:
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
  "name": "The Branded Product Name",
  "lore": "Your atmospheric description here (60-100 words)"
}`,
      messages: [
        {
          role: 'user',
          content: `Create a branded name and description for this product:

Original Name: ${product.name}
Category: ${product.category || 'Gothic Home Decor'}
Original Description: ${product.description || 'No description available'}
Price: $${product.sale_price || product.price}

Return ONLY valid JSON with the format: {"name": "The Branded Name", "lore": "your 60-100 word description"}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const contentText = data.content[0]?.text || null;
  
  // Parse JSON response
  if (contentText) {
    try {
      const parsed = JSON.parse(contentText);
      // Return full object with name and lore
      return {
        name: parsed.name || null,
        lore: parsed.lore || null,
      };
    } catch {
      // Fallback if Claude returns plain text instead of JSON
      return {
        name: null,
        lore: contentText,
      };
    }
  }
  
  return { name: null, lore: null };
}
