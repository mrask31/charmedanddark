export default function ShopHero() {
  return (
    <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img
          src="/images/shop/hero.jpg"
          alt="The Atelier"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>
      
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-5xl italic text-white md:text-6xl lg:text-7xl">
          The Atelier
        </h1>
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-[#C9A84C] md:text-base">
          Curated Darkness for the Modern Mystic
        </p>
      </div>
    </section>
  );
}
