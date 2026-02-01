import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Charmed & Dark',
  description: 'Luxury gothic-romantic ecommerce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
