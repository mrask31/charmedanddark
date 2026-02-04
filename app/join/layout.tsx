import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join the Sanctuary | Charmed & Dark',
  description: 'Enter the Sanctuary for 10% recognition pricing, early access to seasonal drops, and private reflections.',
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
