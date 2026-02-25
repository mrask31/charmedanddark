// Force dynamic rendering for sanctuary pages
export const dynamic = 'force-dynamic';

export default function SanctuaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
