/**
 * Site configuration
 * Centralized site URL and metadata
 */

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://charmedanddark.vercel.app';
}

export function getCanonicalUrl(path: string): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export const SITE_CONFIG = {
  name: 'Charmed & Dark',
  description: 'Premium home goods and apparel',
  url: getSiteUrl(),
} as const;
