import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // Debug endpoint: disabled in production
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not Found', { status: 404 });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data, error } = await supabase
      .from('products')
      .select('handle, title, id, images, image_url')
      .order('title');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format as CSV template
    const csvLines = ['product_handle,product_title,image_1,image_2,image_3,image_4'];
    
    data?.forEach(product => {
      csvLines.push(`${product.handle},${product.title},,,`);
    });

    return NextResponse.json({
      total: data?.length || 0,
      products: data,
      csvTemplate: csvLines.join('\n'),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
