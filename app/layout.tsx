import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Charmed & Dark - The Sanctuary',
  description: 'Elegant gothic goods for the life you actually live. Premium gothic apparel and home decor.',
  openGraph: {
    title: 'Charmed & Dark - The Sanctuary',
    description: 'Elegant gothic goods for the life you actually live.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
