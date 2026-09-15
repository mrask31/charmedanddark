export default function ShopHero() {
  return (
    <section className="relative h-[34vh] min-h-[240px] max-h-[360px] w-full overflow-hidden bg-black">
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
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#ded8cf] md:text-base">
          Gothic goods for everyday living. Find what feels like you.
        </p>
      </div>
    </section>
  );
}
