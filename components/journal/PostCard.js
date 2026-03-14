"use client";

import Link from 'next/link';
import Image from 'next/image';

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).toUpperCase();
}

export default function PostCard({ post }) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group block transition-all"
      style={{ borderRadius: '0px' }}
    >
      <article
        className="h-full overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: '#0e0e1a',
          border: '1px solid rgba(201,169,110,0.2)',
          borderRadius: '0px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.border = '1px solid rgba(201,169,110,0.5)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(201,169,110,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.border = '1px solid rgba(201,169,110,0.2)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Cover image or placeholder */}
        {post.cover_image_url ? (
          <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ aspectRatio: '16/9', backgroundColor: '#0e0e1a' }}
          >
            {/* Gold star icon + C&D text */}
            <div className="flex flex-col items-center gap-2" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.09 8.26L20.18 8.63L15.54 12.74L16.91 19.02L12 15.77L7.09 19.02L8.46 12.74L3.82 8.63L9.91 8.26L12 2Z"
                  fill="#c9a96e"
                />
              </svg>
              <span
                className="text-[10px] uppercase tracking-[0.3em]"
                style={{ color: '#c9a96e' }}
              >
                C&amp;D
              </span>
            </div>
          </div>
        )}

        {/* Card content */}
        <div className="space-y-3 p-5">
          {post.category && (
            <p
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: '#c9a96e' }}
            >
              {post.category}
            </p>
          )}

          <h3
            className="font-serif text-lg leading-snug text-white line-clamp-2 sm:text-[22px]"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            {post.title}
          </h3>

          {post.excerpt && (
            <p
              className="text-[13px] font-light leading-relaxed line-clamp-2"
              style={{ color: '#e8e4dc', fontWeight: 300, fontFamily: 'Inter, sans-serif' }}
            >
              {post.excerpt}
            </p>
          )}

          <p
            className="text-[10px] uppercase tracking-[0.3em]"
            style={{ color: 'rgba(232, 228, 220, 0.5)' }}
          >
            CHARMED &amp; DARK · {formatDate(post.created_at)}
          </p>
        </div>
      </article>
    </Link>
  );
}
