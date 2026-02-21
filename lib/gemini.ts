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
    
    console.log('Gemini API key check:', { hasKey: !!apiKey });
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Initializing Gemini...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format product catalog for context
    const productContext = products
      .map((p) => {
        const lines = Array.isArray(p.description_lines) 
          ? p.description_lines.join('. ')
          : '';
        return `- ${p.title} (${p.category}): ${lines}`;
      })
      .join('\n');

    console.log(`Product context prepared: ${products.length} products`);

    const fullPrompt = `${CURATOR_SYSTEM_PROMPT}

Available Products:
${productContext}

User: ${userPrompt}

Respond as The Curator. Recommend ONE product that matches their mood. Include the exact product title in your response.`;

    console.log('Sending request to Gemini...');
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    console.log('Gemini response received:', text.substring(0, 100));

    // Extract recommended product from response
    let recommendedProduct: Product | null = null;
    for (const product of products) {
      if (text.includes(product.title)) {
        recommendedProduct = product;
        console.log('Matched product:', product.title);
        break;
      }
    }

    return {
      response: text,
      recommendedProduct,
    };
  } catch (error) {
    console.error('Gemini API error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}
