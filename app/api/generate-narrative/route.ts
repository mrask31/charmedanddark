import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/narrative-engine/validator';
import { generateNarrative } from '@/lib/narrative-engine/generator';
import { applyToneControl } from '@/lib/narrative-engine/tone-controller';
import { validateStyle } from '@/lib/narrative-engine/style-validator';
import type { ProductInput } from '@/lib/narrative-engine/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input structure
    const validationResult = validateInput(body);
    
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'validation',
            message: 'Input validation failed',
            details: validationResult.errors,
          },
        },
        { status: 400 }
      );
    }
    
    const input = validationResult.normalized as ProductInput;
    
    // Generate narrative bundle
    const rawBundle = generateNarrative(input);
    
    // Apply tone control
    const tonedBundle = applyToneControl(rawBundle, input.energy_tone);
    
    // Validate style rules
    const styleResult = validateStyle(tonedBundle, input.avoid_list);
    
    if (!styleResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'style_violation',
            message: 'Generated content violates style rules',
            details: styleResult.violations,
          },
        },
        { status: 422 }
      );
    }
    
    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: tonedBundle,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'generation',
          message: 'Internal generation error',
          details: [],
        },
      },
      { status: 500 }
    );
  }
}
