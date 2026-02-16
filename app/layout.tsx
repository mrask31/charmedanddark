import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Charmed & Dark - Elegant Gothic Apparel & Home Decor',
  description: 'Modern gothic apparel and home decor. Elegant, wearable, built to last.',
  openGraph: {
    title: 'Charmed & Dark',
    description: 'Elegant gothic apparel for everyday wear',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
