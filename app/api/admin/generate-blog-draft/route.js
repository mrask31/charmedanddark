import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateSlug } from '@/lib/blog/slug';
import { NextResponse } from 'next/server';
import { isSyncAdminRequest } from '@/lib/admin/sync-auth';

export async function POST(request) {
  if (!isSyncAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { topic, primary_keyword, featured_product_ids } = await request.json();

    if (!topic || !primary_keyword) {
      return NextResponse.json(
        { error: 'topic and primary_keyword are required' },
        { status: 400 }
      );
    }

    let productContext = '';
    if (featured_product_ids && featured_product_ids.length > 0) {
      const { data: products, error: productsError } = await supabaseAdmin
        .from('products')
        .select('name, lore')
        .in('id', featured_product_ids);

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else if (products && products.length > 0) {
        productContext = '\n\nFeatured products:\n' +
          products.map((product) => `- ${product.name}: ${product.lore}`).join('\n');
      }
    }

    const prompt = `You are a content writer for Charmed & Dark, a gothic lifestyle brand. Write a blog post about ${topic}.

Primary keyword: ${primary_keyword}${productContext}

Generate a JSON response with:
- title: SEO-optimized title (60 chars max)
- meta_description: SEO meta description (155 chars max)
- excerpt: Brief summary (150 chars max)
- body_markdown: Full blog post in markdown format (800-1200 words)

Style: Sophisticated, atmospheric, gothic aesthetic. Use evocative language that captures the dark elegance of the brand. Write in a way that feels both timeless and contemporary.

Return ONLY valid JSON, no additional text.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate blog draft' },
        { status: 500 }
      );
    }

    const claudeData = await claudeResponse.json();
    const contentText = claudeData.content[0].text;

    let generatedContent;
    try {
      generatedContent = JSON.parse(contentText);
    } catch {
      console.error('Failed to parse Claude response:', contentText);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    const { title, meta_description, excerpt, body_markdown } = generatedContent;

    if (!title || !meta_description || !excerpt || !body_markdown) {
      return NextResponse.json(
        { error: 'Incomplete content generated' },
        { status: 500 }
      );
    }

    const slug = generateSlug(title);

    const { data: post, error: insertError } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        slug,
        title,
        meta_description,
        excerpt,
        body_markdown,
        primary_keyword,
        featured_product_ids: featured_product_ids || [],
        status: 'draft',
        author: 'AI',
        created_at: new Date().toISOString(),
      })
      .select('id, slug, title, excerpt, status')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save blog draft' },
        { status: 500 }
      );
    }

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error('Generate blog draft error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
