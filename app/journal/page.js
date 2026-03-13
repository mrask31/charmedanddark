import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

export const metadata = {
  title: "Journal | Charmed & Dark",
  description: "Quiet reflections, ritual notes, and gothic musings.",
};

async function getPublishedPosts(page = 1, limit = 12) {
  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .lte('publish_date', new Date().toISOString())
    .order('publish_date', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching posts:', error);
    return { posts: [], total: 0, error };
  }
  
  return { posts: data || [], total: count || 0, error: null };
}

function truncateExcerpt(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default async function Journal({ searchParams }) {
  const page = parseInt(searchParams?.page || '1', 10);
  const { posts, total } = await getPublishedPosts(page);
  
  const totalPages = Math.ceil(total / 12);
  const showPagination = total > 12;

  return (
    <section className="space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          The Journal
        </p>
        <h1 className="font-serif text-3xl uppercase tracking-widest sm:text-4xl">
          Quiet Reflections
        </h1>
        <p className="max-w-2xl text-base leading-7 text-zinc-400">
          Gothic musings, ritual notes, and tales from the sanctuary.
        </p>
      </div>

      {/* Post Grid */}
      {posts.length === 0 ? (
        <div className="border border-white/10 bg-zinc-950 p-12 text-center">
          <p className="text-zinc-400">No posts available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/journal/${post.slug}`}
              className="group block space-y-4 transition-opacity hover:opacity-80"
            >
              {/* Featured Image */}
              {post.featured_image_url && (
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                  <Image
                    src={post.featured_image_url}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}

              {/* Post Content */}
              <div className="space-y-2">
                <h2 className="font-serif text-xl uppercase tracking-wide text-white">
                  {post.title}
                </h2>
                
                <p className="text-sm leading-6 text-zinc-400">
                  {truncateExcerpt(post.excerpt)}
                </p>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-zinc-500">
                  <span>{post.author || 'Charmed & Dark'}</span>
                  <span>•</span>
                  <span>{formatDate(post.publish_date)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {showPagination && (
        <div className="flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={`/journal?page=${page - 1}`}
              className="border border-white/20 bg-black px-6 py-3 text-sm uppercase tracking-widest text-white transition hover:border-[#B89C6D] hover:text-[#B89C6D]"
            >
              Previous
            </Link>
          )}

          <span className="text-sm text-zinc-400">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={`/journal?page=${page + 1}`}
              className="border border-white/20 bg-black px-6 py-3 text-sm uppercase tracking-widest text-white transition hover:border-[#B89C6D] hover:text-[#B89C6D]"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
