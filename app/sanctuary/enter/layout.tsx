// Force dynamic rendering for sanctuary enter page
export const dynamic = 'force-dynamic';

export default function SanctuaryEnterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
