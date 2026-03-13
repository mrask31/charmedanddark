import Link from 'next/link';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'New', href: '/collections/new' },
  { label: 'Apparel', href: '/collections/apparel' },
  { label: 'Home', href: '/collections/home-decor' },
  { label: 'Sanctuary', href: '/join' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/Room set up with frankenstein and ottoman - 1.png"
          alt="Gothic interior"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
      </div>

      {/* Header Navigation */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/Charmed and Dark Logo.png"
              alt="Charmed & Dark"
              width={140}
              height={35}
              className="opacity-90 hover:opacity-100 transition-opacity duration-160"
              priority
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-sans uppercase tracking-widest text-zinc-400 hover:text-white transition-colors duration-160"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="text-zinc-400 hover:text-white transition-colors duration-160"
            aria-label="Shopping cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-tight mb-12 text-balance">
          Elegant gothic goods for the life you actually live.
        </h1>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 text-xs font-sans uppercase tracking-widest text-white border border-white/40 hover:border-gold transition-all duration-160"
          >
            Shop the Threshold
          </Link>
          <Link
            href="/join"
            className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 text-xs font-sans uppercase tracking-widest text-black bg-gold hover:bg-gold/90 transition-all duration-160"
          >
            Enter the Sanctuary
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
      </div>
    </section>
  );
}
