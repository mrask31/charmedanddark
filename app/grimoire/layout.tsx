import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Grimoire | Charmed & Dark',
  description: 'Where your reflections are kept. A private space for Mirror moments.',
};

export default function GrimoireLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
