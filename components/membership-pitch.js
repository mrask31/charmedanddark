import Link from "next/link";
import { Sparkles, Clock, BookOpen } from "lucide-react";

const benefits = [
  {
    icon: Sparkles,
    title: "Sanctuary Price",
    description: "Members-only pricing on all items.",
  },
  {
    icon: Clock,
    title: "Early Drops",
    description: "48-hour early access to new releases.",
  },
  {
    icon: BookOpen,
    title: "The Grimoire",
    description: "Exclusive journal and ritual guides.",
  },
];

export function MembershipPitch() {
  return (
    <section className="grid min-h-[600px] grid-cols-1 lg:grid-cols-2">
      {/* Image Side */}
      <div
        className="relative min-h-[400px] bg-cover bg-center lg:min-h-[600px]"
        style={{
          backgroundImage: `url('/images/homepage/sanctuary-membership.jpg')`,
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content Side */}
      <div className="flex flex-col justify-center bg-zinc-950 px-8 py-16 lg:px-16">
        <h2 className="font-serif text-3xl uppercase tracking-tight text-white lg:text-4xl">
          The Sanctuary
        </h2>

        <div className="mt-12 flex flex-col gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-start gap-4">
              <benefit.icon className="mt-1 h-5 w-5 text-[#B89C6D]" />
              <div>
                <h3 className="text-sm uppercase tracking-wider text-white">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/join"
          className="mt-12 w-fit bg-[#B89C6D] px-8 py-4 text-xs uppercase tracking-widest text-black transition-opacity duration-160 hover:opacity-90"
        >
          Enter the Sanctuary
        </Link>
      </div>
    </section>
  );
}
