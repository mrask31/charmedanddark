/**
 * Background Removal using Replicate RMBG-1.4
 * Preserves original product pixels with alpha channel extraction
 */

export async function removeBackground(imageUrl: string): Promise<Buffer> {
  const replicateApiKey = process.env.REPLICATE_API_TOKEN;

  if (!replicateApiKey) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  try {
    // Call Replicate API for background removal
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003', // RMBG-1.4
        input: {
          image: imageUrl,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Check for specific error types
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Replicate account at https://replicate.com/account/billing');
      }
      
      throw new Error(`Replicate API error (${response.status}): ${errorText}`);
    }

    const prediction = await response.json();
    const predictionId = prediction.id;

    // Poll for completion with timeout
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max
    
    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error(`Polling failed: ${pollResponse.statusText}`);
      }

      result = await pollResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error(`Background removal failed: ${result.error || 'Unknown error'}`);
    }

    if (attempts >= maxAttempts) {
      throw new Error('Background removal timed out after 60 seconds');
    }

    // Download the result image
    const outputUrl = result.output;
    const imageResponse = await fetch(outputUrl);
    
    if (!imageResponse.ok) {
      throw new Error('Failed to download processed image');
    }
    
    const arrayBuffer = await imageResponse.arrayBuffer();
    
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Background removal error:', error);
    throw error;
  }
}
