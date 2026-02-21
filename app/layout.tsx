import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/lib/cart/context';

export const metadata: Metadata = {
  title: 'Charmed & Dark',
  description: 'Everyday Gothic',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
