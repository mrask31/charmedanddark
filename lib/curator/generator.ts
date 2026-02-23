/**
 * Curator's Note Generator
 * Uses Gemini to generate high-end brutalist product descriptions
 */

import { getGeminiModel } from '@/lib/google/gemini';
import { devLog } from '@/lib/utils/logger';

const CURATOR_PROMPT = `Act as a high-end brutalist curator. Write a 2-sentence description of this product that focuses on texture, shadows, and architectural presence. Avoid marketing fluff like "stunning" or "must-have." Be direct, minimal, and focused on material qualities.

Product Title: {title}
Product Type: {type}
Product Description: {description}

Write only the 2-sentence curator's note. No preamble, no explanation.`;

const GENERATION_TIMEOUT_MS = 3000; // 3 seconds

export async function generateCuratorNote(
  title: string,
  productType: string | null,
  description: string | null
): Promise<string | null> {
  try {
    const model = getGeminiModel('darkroom'); // Use Gemini 1.5 Flash
    
    const prompt = CURATOR_PROMPT
      .replace('{title}', title)
      .replace('{type}', productType || 'Product')
      .replace('{description}', description || 'No description available');

    // Race between generation and timeout
    const generationPromise = model.generateContent(prompt);
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Generation timeout')), GENERATION_TIMEOUT_MS)
    );

    const result = await Promise.race([generationPromise, timeoutPromise]);
    
    if (!result) {
      devLog.warn('[Curator] Generation timed out');
      return null;
    }

    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      devLog.warn('[Curator] Empty response from Gemini');
      return null;
    }

    // Clean up the response (remove quotes, extra whitespace)
    const cleaned = text.trim().replace(/^["']|["']$/g, '');
    
    devLog.log('[Curator] Generated note:', cleaned.substring(0, 100) + '...');
    return cleaned;
  } catch (error) {
    if (error instanceof Error && error.message === 'Generation timeout') {
      devLog.warn('[Curator] Generation exceeded 3s timeout, falling back');
      return null;
    }
    console.error('[Curator] Failed to generate note:', error);
    return null;
  }
}
