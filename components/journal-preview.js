import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

/**
 * Homepage Journal Preview — dynamic 3-card layout.
 * Fetches the 3 most recent published posts from Supabase.
 * Falls back to a simple "Read the Journal" link if no posts exist.
 */
export async function JournalPreview() {
  let posts = [];

  try {
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, category, created_at")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3);

    if (data && data.length > 0) {
      posts = data;
    }
  } catch (err) {
    // Silently degrade — show static fallback
  }

  return (
    <section className="bg-black px-8 py-24 lg:px-16">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-[#B89C6D]">
          The Journal
        </span>
        <Link
          href="/journal"
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 transition-colors duration-160 hover:text-white"
        >
          <span>Read the Journal</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Dynamic 3-card grid or single fallback */}
      {posts.length >= 3 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <JournalCard key={post.slug} post={post} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <JournalCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        /* Fallback when no posts exist */
        <Link
          href="/journal"
          className="group block text-center py-12"
        >
          <p className="font-serif text-2xl text-white italic transition-colors group-hover:text-[#B89C6D]">
            Quiet Reflections
          </p>
          <p className="mt-3 text-sm text-zinc-400">
            Gothic musings, ritual notes, and tales from the sanctuary.
          </p>
        </Link>
      )}
    </section>
  );
}

function JournalCard({ post }) {
  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
    : "";

  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group block border border-white/5 p-6 transition-all duration-200 hover:border-[#B89C6D]/40"
    >
      {post.category && (
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#B89C6D]">
          {post.category}
        </span>
      )}
      <h3 className="mt-3 font-serif text-lg text-white leading-snug line-clamp-2 transition-colors group-hover:text-[#B89C6D]">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-2">
          {post.excerpt}
        </p>
      )}
      {formattedDate && (
        <p className="mt-4 text-[10px] uppercase tracking-widest text-zinc-500">
          {formattedDate}
        </p>
      )}
    </Link>
  );
}
