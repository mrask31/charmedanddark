import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/drops", label: "Drops" },
  { href: "/about", label: "About" },
  { href: "/join", label: "Join" },
];

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">
            Threshold
          </p>
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Charmed & Dark
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
