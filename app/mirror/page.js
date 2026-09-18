import Link from 'next/link';
import TheMirror from '@/components/the-mirror';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'The Mirror — Your Gothic Shopping Assistant',
  description: 'Describe a style, gift, item, budget, or mood. The Mirror helps you find gothic clothing, bookish gifts, and home décor from Charmed & Dark.',
  alternates: { canonical: 'https://www.charmedanddark.com/mirror' },
};

export default function MirrorPage() {
  return <>
    <main>
      <div className="mx-auto max-w-3xl px-5 pt-10 text-center sm:px-8 sm:pt-14">
        <Link href="/shop" className="inline-flex min-h-11 items-center text-sm text-[#d4b984] underline underline-offset-4">Back to the shop</Link>
        <h1 className="mt-5 font-serif text-4xl text-[#f5f0e8] sm:text-5xl">The Mirror</h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-300">Not sure what you’re looking for? Describe a piece, a person, or a feeling. We’ll help you find what fits.</p>
      </div>
      <TheMirror />
    </main>
    <Footer />
  </>;
}
