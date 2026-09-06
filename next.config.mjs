/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  async headers() {
    return process.env.VERCEL_ENV === 'preview'
      ? [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
      : [];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/shop/ols/products/:path*',
        destination: '/shop/:path*',
        permanent: true,
      },
      {
        source: '/shop/ols/categories/:path*',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/shop/ols/:path*',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'charmedanddark.vercel.app' }],
        destination: 'https://www.charmedanddark.com/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
