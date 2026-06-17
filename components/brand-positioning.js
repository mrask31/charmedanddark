/**
 * Brand Positioning — short copy between Hero and product sections on homepage.
 */
export function BrandPositioning() {
  return (
    <section className="bg-black px-8 py-16 lg:px-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="font-serif text-2xl italic text-white md:text-3xl lg:text-4xl"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', lineHeight: 1.3 }}
        >
          More Than a Store. A Darker Way to Live.
        </h2>
        <p
          className="mt-5 text-sm font-light leading-relaxed md:text-base"
          style={{ color: 'rgba(232, 228, 220, 0.6)', fontFamily: 'Inter, sans-serif' }}
        >
          Charmed &amp; Dark curates gothic d&eacute;cor, apparel, accessories, seasonal collections, and everyday treasures for those who find beauty in the unusual.
        </p>
      </div>
    </section>
  );
}
