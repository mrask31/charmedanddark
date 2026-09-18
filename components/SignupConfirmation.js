'use client';

import { useEffect, useRef } from 'react';

export default function SignupConfirmation({ email, onReset }) {
  const panel = useRef(null);
  useEffect(() => { panel.current?.focus({ preventScroll: true }); panel.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, []);
  return <div ref={panel} tabIndex={-1} role="status" aria-live="polite" className="w-full border border-[#c9a96e] bg-[#1b1812] p-5 text-left focus:outline-none sm:max-w-md">
    <p className="font-serif text-2xl text-[#f5f0e8]">Your signup was received.</p>
    <p className="mt-2 break-words text-sm text-[#e8e4dc]">Thank you. We received your request for <strong>{email}</strong>. You don’t need to submit it again.</p>
    <p className="mt-3 text-xs leading-relaxed text-zinc-300">If an email confirmation is required, look in your inbox and spam folder. An immediate welcome email may not arrive.</p>
    <button type="button" onClick={onReset} className="mt-3 min-h-11 text-sm text-[#d4b984] underline underline-offset-4">Use a different email</button>
  </div>;
}
