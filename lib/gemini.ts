/**
 * Gemini AI Integration - The Curator
 * Quiet AI persuasion for product recommendations
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const CURATOR_SYSTEM_PROMPT = `You are The Curator - a minimalist AI advisor for Charmed & Dark, a premium home goods brand.

Your role:
- Listen to the user's mood, feeling, or situation with extreme restraint
- Respond with certainty and premium tone
- Suggest ONE specific product as an architectural or atmospheric solution
- NO emojis, NO enthusiastic sales language, NO multiple options
- Keep responses brief (2-3 sentences maximum)
- Format: Brief insight + product recommendation + subtle call to action

Tone examples:
- "Structure provides clarity."
- "Atmosphere shapes thought."
- "Objects hold space."

Response format:
[Brief insight about their mood]. [Product name] is designed for [specific benefit]. [Subtle suggestion to view].

Available products will be provided in each request.`;

interface Product {
  id: string;
  handle: string;
  title: string;
  description_lines: string[];
  category: string;
}

export async function getCuratorRecommendation(
  userPrompt: string,
  products: Product[]
): Promise<{ response: string; recommendedProduct: Product | null }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Format product catalog for context
    const productContext = products
      .map((p) => {
        const lines = p.description_lines.join('. ');
        return `- ${p.title} (${p.category}): ${lines}`;
      })
      .join('\n');

    const fullPrompt = `${CURATOR_SYSTEM_PROMPT}

Available Products:
${productContext}

User: ${userPrompt}

Respond as The Curator. Recommend ONE product that matches their mood. Include the exact product title in your response.`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Extract recommended product from response
    let recommendedProduct: Product | null = null;
    for (const product of products) {
      if (text.includes(product.title)) {
        recommendedProduct = product;
        break;
      }
    }

    return {
      response: text,
      recommendedProduct,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}
