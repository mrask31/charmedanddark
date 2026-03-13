import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Verify Vercel Cron Secret via Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Query scheduled posts ready to publish (status='scheduled', publish_date <= NOW())
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('id, slug')
      .eq('status', 'scheduled')
      .lte('publish_date', new Date().toISOString());

    if (error) throw error;

    // If no posts to publish, return early
    if (!posts || posts.length === 0) {
      console.log('No scheduled posts to publish');
      return NextResponse.json({
        success: true,
        published: 0,
        slugs: [],
      });
    }

    // Update status to 'published' for all matching posts
    const { error: updateError } = await supabaseAdmin
      .from('blog_posts')
      .update({ status: 'published' })
      .in('id', posts.map((p) => p.id));

    if (updateError) throw updateError;

    // Revalidate the journal index path
    revalidatePath('/journal');

    // Revalidate each published post's detail page
    posts.forEach((post) => {
      revalidatePath(`/journal/${post.slug}`);
    });

    // Log count of published posts and slugs
    console.log(`Published ${posts.length} posts:`, posts.map((p) => p.slug));

    // Return JSON response with success, published count, and slugs
    return NextResponse.json({
      success: true,
      published: posts.length,
      slugs: posts.map((p) => p.slug),
    });
  } catch (err) {
    // Handle errors: return 500 if database update fails
    console.error('Auto-publish error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
