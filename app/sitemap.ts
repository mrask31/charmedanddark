import { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { supabase } from "@/lib/supabase/client";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.charmedanddark.com";
  const products = await getProducts();
  // Journal remains application content; only published public URLs enter SEO.
  const journalUrls: MetadataRoute.Sitemap = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from('blog_posts')
      .select('slug, updated_at').eq('status', 'published')
      .order('slug').range(offset, offset + 499);
    if (error) throw new Error('Published Journal sitemap lookup failed');
    for (const post of data || []) {
      if (post.slug) journalUrls.push({ url: `${baseUrl}/journal/${post.slug}`, ...(post.updated_at && { lastModified: post.updated_at }), changeFrequency: 'monthly', priority: 0.6 });
    }
    if (!data || data.length < 500) break;
  }
  const productUrls: MetadataRoute.Sitemap = products.filter((product: any) => !product.hidden).map((product: any) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    ...(product.updatedAt && { lastModified: product.updatedAt }),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  return [
    { url: baseUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/shop`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/collections/kiss-lock-bags`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/collections/smutty-good-girl`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/sale`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/drops`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/join`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/sanctuary`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/journal`, changeFrequency: 'weekly', priority: 0.7 },
    ...journalUrls,
    ...productUrls,
  ];
}
