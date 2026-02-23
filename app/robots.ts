import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/config/site';

/**
 * Dynamic robots.txt generation
 * Allows indexing on production, disallows on preview deployments
 */

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const isProduction = siteUrl.includes('charmedanddark.vercel.app') || 
                       siteUrl.includes('charmedanddark.com');

  if (!isProduction) {
    // Disallow all crawling on preview/staging deployments
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Production: allow crawling with sensible restrictions
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/studio/',
          '/threshold/',
          '/_next/',
          '/cart',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
