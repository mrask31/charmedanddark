import "./globals.css";
import { Cormorant_Garamond, Inter } from 'next/font/google';
import Script from 'next/script';
import { StickyNav } from "@/components/StickyNav";
import MobileTabNav from "@/components/MobileTabNav";
import SlideOutCart from "@/components/SlideOutCart";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { PHProvider } from "@/components/providers/posthog-provider";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://charmedanddark.com'),
  title: {
    default: 'Charmed & Dark | Premium Gothic Lifestyle',
    template: '%s | Charmed & Dark',
  },
  description: 'The Sanctuary. Premium gothic apparel and dark home decor, curated for those who live in the aesthetic.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Charmed & Dark',
    images: [{ url: '/og-default.svg', width: 1200, height: 630, alt: 'Charmed & Dark' }],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export const viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${cormorantGaramond.variable} ${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Charmed & Dark',
              url: 'https://charmedanddark.com',
              logo: 'https://charmedanddark.com/logo.png',
              sameAs: [
                'https://instagram.com/charmedanddark',
              ],
              description: 'Premium gothic lifestyle brand.',
            }),
          }}
        />
        <div className="min-h-screen bg-black text-white">
          <PHProvider>
          <AuthProvider>
            <CartProvider>
              <StickyNav />
              {children}
              <SlideOutCart />
              <MobileTabNav />
            </CartProvider>
          </AuthProvider>
          </PHProvider>
        </div>
        <Script
          id="klaviyo-onsite"
          src={`https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${process.env.NEXT_PUBLIC_KLAVIYO_SITE_ID}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
