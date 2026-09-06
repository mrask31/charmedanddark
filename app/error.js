'use client';

import Link from 'next/link';

export default function StorefrontError({ reset }) {
  return (
    <main className="min-h-[65vh] bg-[#0a0a12] px-6 py-24 text-center text-[#f5f0e8]">
      <h1 className="font-serif text-3xl sm:text-4xl">Let’s try that again</h1>
      <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-zinc-400">
        This page couldn’t load just now. Your saved bag is still available.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button type="button" onClick={reset} className="min-h-11 border border-[#c9a96e] px-6 py-3 text-sm text-[#c9a96e] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9a96e]">
          Try again
        </button>
        <Link href="/" className="min-h-11 px-6 py-3 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c9a96e]">
          Return home
        </Link>
      </div>
    </main>
  );
}
