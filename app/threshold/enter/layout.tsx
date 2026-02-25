// Force dynamic rendering for threshold enter page
export const dynamic = 'force-dynamic';

export default function ThresholdEnterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
