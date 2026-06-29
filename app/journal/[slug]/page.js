import { notFound } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import ProductCallout from "@/components/ProductCallout";
import EmailSignupCTA from "@/components/EmailSignupCTA";

// ISR: Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

/**
 * Query a blog post by slug
 * Requirements: 2.1, 2.6
 */
async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Query featured products by IDs
 * Requirements: 6.1
 */
async function getFeaturedProducts(productIds) {
  if (!productIds || productIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, lore, image_url, price, sale_price")
    .in("id", productIds)
    .eq("hidden", false);

  if (error || !data) {
    return [];
  }

  return data;
}

/**
 * Generate static paths for published posts
 * Requirements: 10.2, 10.3
 */
export async function generateStaticParams() {
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published");

  if (!data) return [];

  return data.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate dynamic metadata for SEO
 * Requirements: 3.2, 3.3, 3.4, 3.6
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Charmed & Dark",
      description: "This journal entry does not exist.",
    };
  }

  const keywords = [post.primary_keyword, ...(post.secondary_keywords || [])].filter(Boolean);
  const description = post.meta_description || post.excerpt || "";
  const canonicalUrl = `https://charmedanddark.com/journal/${post.slug}`;
  const ogImages = post.featured_image_url
    ? [{ url: post.featured_image_url, width: 1200, height: 630, alt: post.title }]
    : [];

  return {
    title: `${post.title} | Charmed & Dark Journal`,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      siteName: "Charmed & Dark",
      images: ogImages,
      type: "article",
      publishedTime: post.publish_date,
      modifiedTime: post.updated_at || post.publish_date,
      authors: [post.author || "Charmed & Dark"],
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      ...(post.featured_image_url && { images: [post.featured_image_url] }),
    },
  };
}

/**
 * Journal Post Detail Page
 * Requirements: 2.1, 2.3, 2.4, 2.6, 6.1
 */
export default async function JournalEntry({ params }) {
  const { slug } = await params;

  // Query post by slug
  const post = await getPostBySlug(slug);

  // Return 404 if post doesn't exist
  if (!post) {
    return notFound();
  }

  // Query featured products
  const featuredProducts = await getFeaturedProducts(
    post.featured_product_ids || []
  );

  // Extract product slugs for markdown parser
  const productSlugs = featuredProducts.map((p) => p.slug);

  // Format publish date
  const publishDate = new Date(post.publish_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <article className="max-w-4xl mx-auto px-4 py-16">
        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="relative w-full aspect-[16/9] mb-8 overflow-hidden">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        )}

        {/* Title */}
        <h1
          className="font-serif text-5xl md:text-6xl mb-6 uppercase tracking-widest"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {post.title}
        </h1>

        {/* Author and Publish Date */}
        <div className="flex items-center gap-4 text-zinc-400 text-sm uppercase tracking-wider mb-12 pb-8 border-b border-white/10">
          <span>By {post.author}</span>
          <span>•</span>
          <time dateTime={post.publish_date}>{publishDate}</time>
        </div>

        {/* Article Body with Markdown Rendering */}
        <div className="prose prose-invert max-w-none">
          <MarkdownRenderer
            content={post.body_markdown}
            productSlugs={productSlugs}
          />
        </div>

        {/* Featured Product Callouts */}
        {featuredProducts.length > 0 && (
          <div className="mt-12">
            {featuredProducts.map((product) => (
              <ProductCallout key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Email Signup CTA */}
        <div className="mt-16">
          <EmailSignupCTA />
        </div>
      </article>

      {/* JSON-LD BlogPosting structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.meta_description || post.excerpt,
            ...(post.featured_image_url && { image: post.featured_image_url }),
            datePublished: post.publish_date,
            dateModified: post.updated_at || post.publish_date,
            author: {
              "@type": "Organization",
              name: post.author || "Charmed & Dark",
              url: "https://charmedanddark.com",
            },
            publisher: {
              "@type": "Organization",
              name: "Charmed & Dark",
              url: "https://charmedanddark.com",
              ...(post.featured_image_url && {
                logo: {
                  "@type": "ImageObject",
                  url: "https://charmedanddark.com/images/logo.png",
                },
              }),
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://charmedanddark.com/journal/${post.slug}`,
            },
            ...(post.category && { articleSection: post.category }),
            ...(post.primary_keyword && {
              keywords: [
                post.primary_keyword,
                ...(post.secondary_keywords || []),
              ]
                .filter(Boolean)
                .join(", "),
            }),
          }),
        }}
      />
    </div>
  );
}
