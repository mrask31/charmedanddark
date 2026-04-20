/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
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
    ]
  },
};

export default nextConfig;
