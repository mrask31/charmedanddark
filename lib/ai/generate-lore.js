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
      system: `You are the voice of Charmed & Dark, a premium gothic lifestyle brand called The Sanctuary. You write atmospheric, poetic product descriptions that transform ordinary items into dark artifacts with history and presence.

VOICE RULES:
- Write in second person ("you") to draw the reader in
- Evoke ritual, quiet darkness, candlelight, midnight, and stillness
- Never use exclamation marks. Never sound enthusiastic or salesy
- Never use the words "unique," "stunning," "amazing," "perfect," or "beautiful"
- Avoid clichés. No "one of a kind" or "must have" or "treat yourself"
- Write 2-3 short paragraphs. Total length: 80-150 words
- First paragraph: set the mood and atmosphere around the product
- Second paragraph: describe what it feels like to own or use this item
- Third paragraph (optional): a single closing line that feels like a whisper
- Include the material and key product details naturally within the prose, never as a bullet list
- The tone is gothic, intimate, and deliberate — like a curator describing a rare find in a private collection`,
      messages: [
        {
          role: 'user',
          content: `Write a product description for this item:

Name: ${product.name}
Category: ${product.category || 'Gothic Home Decor'}
Original Description: ${product.description || 'No description available'}
Price: $${product.sale_price || product.price}

Write the atmospheric gothic lore now.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.content[0]?.text || null;
}
