'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

const DEFAULT_REDIRECT = '/shop';

function safeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_REDIRECT;
  }

  return value;
}

export default function DiscountRedirectPage() {
  const params = useParams<{ code?: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const rawCode = Array.isArray(params.code) ? params.code[0] : params.code;
    const code = rawCode ? decodeURIComponent(rawCode).trim() : '';
    const redirect = safeRedirectPath(searchParams.get('redirect'));

    if (code) {
      localStorage.setItem('shopify_discount_code', code);
    }

    router.replace(redirect);
  }, [params.code, router, searchParams]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d6c27a]">Applying your gift</p>
        <h1 className="text-2xl font-serif">Preparing your discount...</h1>
        <p className="text-sm text-white/60">You will be redirected to the shop in a moment.</p>
      </div>
    </main>
  );
}
