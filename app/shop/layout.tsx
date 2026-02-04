import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Gothic Home Decor | Charmed & Dark',
  description: 'Explore gothic home decor, ritual objects, and quiet luxury pieces. Unlock Sanctuary pricing with membership.',
  openGraph: {
    title: 'Shop Gothic Home Decor | Charmed & Dark',
    description: 'Explore gothic home decor, ritual objects, and quiet luxury pieces.',
    type: 'website',
  }
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
