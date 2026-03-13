export function EditorialBreak() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/homepage/editorial-break.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>
      <div className="relative z-10 flex h-full items-center justify-center px-8">
        <p className="max-w-3xl text-center font-serif text-2xl italic leading-relaxed text-white md:text-4xl lg:text-5xl">
          Objects for quiet nights and softer rooms.
        </p>
      </div>
    </section>
  );
}
