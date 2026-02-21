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
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = await response.json();
    const predictionId = prediction.id;

    // Poll for completion
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${replicateApiKey}`,
        },
      });

      result = await pollResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error('Background removal failed');
    }

    // Download the result image
    const outputUrl = result.output;
    const imageResponse = await fetch(outputUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Background removal error:', error);
    throw error;
  }
}
