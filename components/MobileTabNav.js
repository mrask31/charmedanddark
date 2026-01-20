import Link from "next/link";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/drops", label: "Drops" },
  { href: "/about", label: "About" },
  { href: "/join", label: "Join" },
];

export default function MobileTabNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1 px-4 py-3 text-center text-xs text-white/70">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-full px-2 py-2 transition-colors hover:text-white"
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
