/**
 * Background Generation using Stability AI or Replicate
 * Generates branded brutalist backdrops separately from product
 */

interface BackgroundOptions {
  prompt: string;
  width: number;
  height: number;
}

export async function generateBackground(options: BackgroundOptions): Promise<Buffer> {
  const { prompt, width, height } = options;
  
  // Try Replicate first (Stable Diffusion)
  const replicateApiKey = process.env.REPLICATE_API_TOKEN;
  
  if (replicateApiKey) {
    return generateWithReplicate(prompt, width, height, replicateApiKey);
  }

  // Fallback: Try Stability AI
  const stabilityApiKey = process.env.STABILITY_API_KEY;
  
  if (stabilityApiKey) {
    return generateWithStability(prompt, width, height, stabilityApiKey);
  }

  throw new Error('No AI generation API key configured (REPLICATE_API_TOKEN or STABILITY_API_KEY)');
}

async function generateWithReplicate(
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
        version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4', // SDXL
        input: {
          prompt,
          width,
          height,
          num_outputs: 1,
          negative_prompt: 'product, object, text, watermark, logo, people, faces',
        },
      }),
    });

    const prediction = await response.json();
    const predictionId = prediction.id;

    // Poll for completion
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      });

      result = await pollResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error('Background generation failed');
    }

    // Download the result
    const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    const imageResponse = await fetch(outputUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Replicate generation error:', error);
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
        height,
        width,
        samples: 1,
        steps: 30,
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
