import { supabase } from '@/lib/supabase/client';
import JournalHero from '@/components/journal/JournalHero';
import PostGrid from '@/components/journal/PostGrid';

export const metadata = {
  title: 'Journal | Charmed & Dark',
  description: 'Quiet reflections, ritual notes, and gothic musings.',
};

export const revalidate = 3600; // ISR — revalidate every hour

async function getJournalData() {
  // Total count of published posts
  const { count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  // Featured post — most recent
  const { data: featured } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!featured) {
    return { featured: null, posts: [], totalCount: 0 };
  }

  // Grid posts — exclude featured, first 6
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .neq('id', featured.id)
    .order('created_at', { ascending: false })
    .range(0, 5);

  return {
    featured,
    posts: posts || [],
    totalCount: count || 0,
  };
}

export default async function JournalPage() {
  const { featured, posts, totalCount } = await getJournalData();

  const isEmpty = !featured && posts.length === 0;

  return (
    <div style={{ backgroundColor: '#08080f', overflowX: 'hidden' }}>
      <JournalHero featured={featured} />

      {isEmpty ? (
        <div className="px-4 py-24 text-center sm:px-6">
          <p
            className="text-base font-light italic"
            style={{
              color: 'rgba(232, 228, 220, 0.5)',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
            }}
          >
            Nothing here yet. The sanctuary is quiet.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <PostGrid
            initialPosts={posts}
            featuredId={featured?.id}
            totalCount={totalCount}
          />
        </div>
      )}
    </div>
  );
}
