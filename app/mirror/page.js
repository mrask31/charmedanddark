import Link from 'next/link';
import TheMirror from '@/components/the-mirror';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'The Mirror — Find Your Next Piece',
  description: 'A moment for your mood. Explore The Mirror for gothic shopping inspiration for yourself or a friend.',
  alternates: { canonical: 'https://www.charmedanddark.com/mirror' },
};

export default function MirrorPage() {
  return <>
    <main>
      <div className="mx-auto max-w-3xl px-5 pt-10 text-center sm:px-8 sm:pt-14">
        <Link href="/shop" className="inline-flex min-h-11 items-center text-sm text-[#d4b984] underline underline-offset-4">Back to the shop</Link>
        <h1 className="mt-5 font-serif text-4xl text-[#f5f0e8] sm:text-5xl">The Mirror</h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-300">A little inspiration for yourself or someone you know. Share a mood and see what finds you.</p>
      </div>
      <TheMirror />
    </main>
    <Footer />
  </>;
}
