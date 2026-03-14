"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import PostCard from './PostCard';

const PAGE_SIZE = 6;

export default function PostGrid({ initialPosts, featuredId, totalCount }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(false);
  const hasMore = posts.length < (totalCount - 1); // -1 for featured

  async function loadMore() {
    setLoading(true);
    try {
      const from = posts.length;
      const to = from + PAGE_SIZE - 1;

      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .neq('id', featuredId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (data?.length) {
        setPosts((prev) => [...prev, ...data]);
      }
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!posts.length) return null;

  return (
    <section style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      {/* Eyebrow */}
      <p
        className="mb-8 text-[11px] uppercase tracking-[0.3em]"
        style={{ color: '#c9a96e' }}
      >
        ALL ENTRIES
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full px-8 py-3 text-sm font-medium transition-colors hover:bg-[#c9a96e]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080f] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ border: '1px solid #c9a96e', color: '#c9a96e' }}
          >
            {loading ? 'LOADING…' : 'LOAD MORE ENTRIES'}
          </button>
        </div>
      )}
    </section>
  );
}
