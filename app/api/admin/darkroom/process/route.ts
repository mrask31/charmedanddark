import { NextRequest } from 'next/server';
import { processImagePipeline } from '@/lib/darkroom/pipeline';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('csv') as File;

    if (!file) {
      return new Response(JSON.stringify({ 
        error: 'No file provided' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const csvText = await file.text();
    const lines = csvText.split('\n').filter(Boolean);
    
    if (lines.length < 2) {
      return new Response(JSON.stringify({ 
        error: 'CSV file is empty or has no data rows' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse CSV header - handle quoted headers
    const headerLine = lines[0].replace(/"/g, '');
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
    
    const productHandleIndex = headers.indexOf('product_handle') >= 0 
      ? headers.indexOf('product_handle')
      : headers.indexOf('handle');
    const productTitleIndex = headers.indexOf('product_title') >= 0
      ? headers.indexOf('product_title')
      : headers.indexOf('title');
    
    // Find all image columns (image_1, image_2, image_3, image_4, etc.)
    const imageIndices: number[] = [];
    headers.forEach((header, index) => {
      if (header.match(/^image_?\d+$/)) {
        imageIndices.push(index);
      }
    });
    
    // Fallback to single image_url column if no image_N columns found
    if (imageIndices.length === 0) {
      const imageUrlIndex = headers.indexOf('image_url') >= 0
        ? headers.indexOf('image_url')
        : headers.indexOf('image');
      if (imageUrlIndex >= 0) {
        imageIndices.push(imageUrlIndex);
      }
    }

    if (productHandleIndex < 0 || imageIndices.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'CSV must contain product_handle (or handle) and at least one image column (image_1, image_2, etc. or image_url)',
        foundHeaders: headers,
        requiredHeaders: ['product_handle or handle', 'image_1, image_2, ... or image_url']
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Process each product
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const productHandle = values[productHandleIndex];
          const productTitle = productTitleIndex >= 0 ? values[productTitleIndex] : productHandle;
          
          // Collect all image URLs for this product
          const sourceImageUrls = imageIndices
            .map(idx => values[idx])
            .filter(url => url && url.length > 0);

          if (!productHandle || sourceImageUrls.length === 0) continue;

          const jobId = `job-${i}`;

          // Send initial status
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              id: jobId,
              productHandle,
              productTitle,
              status: 'pending',
              imageCount: sourceImageUrls.length,
            })}\n\n`)
          );

          try {
            // Process all images through pipeline
            const result = await processImagePipeline({
              productHandle,
              productTitle,
              sourceImageUrls, // Now an array
              onProgress: (status) => {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    id: jobId,
                    productHandle,
                    productTitle,
                    status,
                    imageCount: sourceImageUrls.length,
                  })}\n\n`)
                );
              },
            });

            // Send completion
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                id: jobId,
                productHandle,
                productTitle,
                status: 'complete',
                imageUrls: result.imageUrls, // Now an array
                imageCount: result.imageUrls.length,
              })}\n\n`)
            );
          } catch (error) {
            console.error(`Error processing ${productHandle}:`, error);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                id: jobId,
                productHandle,
                productTitle,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
              })}\n\n`)
            );
          }
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Darkroom processing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
