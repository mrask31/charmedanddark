/**
 * AI Background Selector for Darkroom
 * Uses Gemini to choose best background (stone, candle, glass) for product
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export type BackgroundType = 'stone' | 'candle' | 'glass';

const BACKGROUND_PROMPTS: Record<BackgroundType, string> = {
  stone: 'Dark brutalist concrete wall, moody single-source lighting, architectural shadows, empty space, product photography backdrop, matte finish, stone texture',
  candle: 'Dark moody candlelit scene, warm ambient glow, soft shadows, intimate atmosphere, product photography backdrop, matte finish',
  glass: 'Dark reflective glass surface, subtle highlights, modern minimalist, clean shadows, product photography backdrop, matte finish',
};

/**
 * Select best background type for product using AI
 * @param productTitle - Product title
 * @param productTags - Product tags
 * @returns Background type (stone, candle, or glass)
 */
export async function selectBackgroundForProduct(
  productTitle: string,
  productTags: string[]
): Promise<BackgroundType> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.warn('GEMINI_API_KEY not configured, defaulting to stone background');
    return 'stone';
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are a product photography expert for a gothic, minimalist brand called "Charmed & Dark".

Product: ${productTitle}
Tags: ${productTags.join(', ')}

Choose the BEST background for this product from these options:
- stone: Dark brutalist concrete (best for: heavy objects, furniture, structural items)
- candle: Warm candlelit atmosphere (best for: candles, ritual items, intimate objects)
- glass: Reflective glass surface (best for: glassware, delicate items, transparent objects)

Respond with ONLY ONE WORD: stone, candle, or glass

Your choice:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim().toLowerCase();

    // Validate response
    if (response === 'stone' || response === 'candle' || response === 'glass') {
      return response as BackgroundType;
    }

    // Fallback if AI returns invalid response
    console.warn(`Invalid AI response: ${response}, defaulting to stone`);
    return 'stone';
  } catch (error) {
    console.error('Background selection error:', error);
    return 'stone'; // Safe fallback
  }
}

/**
 * Get background generation prompt for selected type
 */
export function getBackgroundPrompt(backgroundType: BackgroundType): string {
  return BACKGROUND_PROMPTS[backgroundType];
}
