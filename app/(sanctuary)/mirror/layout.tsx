import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Mirror | Charmed & Dark',
  description: 'A private reflection ritual. One moment. One object. No noise.',
};

export default function MirrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
