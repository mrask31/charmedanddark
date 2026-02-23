/**
 * Consolidated Gemini AI Client
 * Single entry point for all Gemini usage across the application
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

/**
 * Gemini usage purposes with specific model configurations
 */
export type GeminiPurpose = 'darkroom' | 'sanctuary';

/**
 * Model configuration per purpose
 */
const MODEL_CONFIG: Record<GeminiPurpose, string> = {
  darkroom: 'gemini-1.5-flash',    // Background selection for product images
  sanctuary: 'gemini-2.5-flash',   // Curator chat for product recommendations
};

/**
 * Get Gemini API key from environment
 */
function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return apiKey;
}

/**
 * Get configured Gemini model for specific purpose
 * @param purpose - Usage purpose (darkroom or sanctuary)
 * @returns Configured GenerativeModel instance
 */
export function getGeminiModel(purpose: GeminiPurpose): GenerativeModel {
  const apiKey = getGeminiApiKey();
  const modelName = MODEL_CONFIG[purpose];
  
  console.log(`[Gemini] Initializing model for ${purpose}: ${modelName}`);
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Get model name for a specific purpose (for logging)
 */
export function getModelName(purpose: GeminiPurpose): string {
  return MODEL_CONFIG[purpose];
}
