import Link from 'next/link';
import Image from 'next/image';

const BENEFITS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="square" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Sanctuary Price',
    description: '15% off everything, always.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="square" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Early Drops',
    description: '48-hour early access to new releases.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="square" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'The Grimoire',
    description: 'Members-only content and rituals.',
  },
];

export default function MembershipPitch() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
      {/* Image Side */}
      <div className="relative h-[400px] lg:h-auto">
        <Image
          src="/images/Candle with Ethos 3.png"
          alt="Sanctuary atmosphere"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content Side */}
      <div className="flex flex-col justify-center px-8 py-16 lg:px-16 bg-zinc-950">
        <h2 className="font-serif text-3xl md:text-4xl text-white uppercase tracking-tight mb-12">
          The Sanctuary
        </h2>

        {/* Benefits */}
        <div className="space-y-8 mb-12">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex items-start gap-4">
              <div className="text-gold flex-shrink-0 mt-0.5">
                {benefit.icon}
              </div>
              <div>
                <h3 className="text-sm text-white uppercase tracking-widest mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm text-zinc-400">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/join"
          className="inline-flex items-center justify-center w-fit px-10 py-4 text-xs font-sans uppercase tracking-widest text-black bg-gold hover:bg-gold/90 transition-colors duration-160 rounded-none"
        >
          Enter the Sanctuary
        </Link>
      </div>
    </section>
  );
}
