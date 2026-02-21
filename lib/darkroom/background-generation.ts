/**
 * Background Generation using SDXL Lightning (4-step, ultra-fast, low-cost)
 * Generates branded brutalist backdrops separately from product
 * COST OPTIMIZED: ~$0.001 per generation vs $0.08+ for standard SDXL
 */

interface BackgroundOptions {
  prompt: string;
  width: number;
  height: number;
}

export async function generateBackground(options: BackgroundOptions): Promise<Buffer> {
  const { prompt, width, height } = options;
  
  // Try Replicate first (SDXL Lightning - 4 step model)
  const replicateApiKey = process.env.REPLICATE_API_TOKEN;
  
  if (replicateApiKey) {
    return generateWithReplicateLightning(prompt, width, height, replicateApiKey);
  }

  // Fallback: Try Stability AI with minimal steps
  const stabilityApiKey = process.env.STABILITY_API_KEY;
  
  if (stabilityApiKey) {
    return generateWithStability(prompt, width, height, stabilityApiKey);
  }

  throw new Error('No AI generation API key configured (REPLICATE_API_TOKEN or STABILITY_API_KEY)');
}

async function generateWithReplicateLightning(
  prompt: string,
  width: number,
  height: number,
  apiKey: string
): Promise<Buffer> {
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // SDXL Lightning 4-step - Ultra fast, ultra cheap
        version: '5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f',
        input: {
          prompt,
          width: Math.min(width, 1024), // Cap at 1024
          height: Math.min(height, 1024), // Cap at 1024
          num_outputs: 1,
          num_inference_steps: 4, // CRITICAL: 4 steps only
          guidance_scale: 0, // Lightning models don't use guidance
          negative_prompt: 'product, object, text, watermark, logo, people, faces',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate API error (${response.status}): ${errorText}`);
    }

    const prediction = await response.json();
    const predictionId = prediction.id;

    // Poll for completion with timeout
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max (Lightning is fast)
    
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error(`Polling failed: ${pollResponse.statusText}`);
      }

      result = await pollResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error(`Background generation failed: ${result.error || 'Unknown error'}`);
    }

    if (attempts >= maxAttempts) {
      throw new Error('Background generation timed out after 30 seconds');
    }

    // Download the result
    const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    const imageResponse = await fetch(outputUrl);
    
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated background');
    }
    
    const arrayBuffer = await imageResponse.arrayBuffer();
    
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Replicate Lightning generation error:', error);
    throw error;
  }
}

async function generateWithStability(
  prompt: string,
  width: number,
  height: number,
  apiKey: string
): Promise<Buffer> {
  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1,
          },
          {
            text: 'product, object, text, watermark, logo, people, faces',
            weight: -1,
          },
        ],
        cfg_scale: 7,
        height: Math.min(height, 1024), // Cap at 1024
        width: Math.min(width, 1024), // Cap at 1024
        samples: 1,
        steps: 15, // REDUCED from 30 to 15 for cost savings
      }),
    });

    if (!response.ok) {
      throw new Error(`Stability API error: ${response.statusText}`);
    }

    const result = await response.json();
    const base64Image = result.artifacts[0].base64;
    
    return Buffer.from(base64Image, 'base64');
  } catch (error) {
    console.error('Stability generation error:', error);
    throw error;
  }
}
