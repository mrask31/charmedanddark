import Image from 'next/image';

export default function EditorialBreak() {
  return (
    <section className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/Room set up with frankenstein and ottoman - 2.png"
        alt="Gothic atmosphere"
        fill
        className="object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Text Overlay */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-white italic text-center max-w-3xl leading-relaxed">
          Objects for quiet nights and softer rooms.
        </p>
      </div>
    </section>
  );
}
