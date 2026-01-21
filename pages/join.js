import Head from "next/head";
import { useState } from "react";

const benefits = [
  {
    title: "Sanctuary Pricing",
    body: "10% off, permanently. Two prices appear on every piece.",
  },
  {
    title: "Early Drop Windows",
    body: "Preview and access before the Threshold opens.",
  },
  {
    title: "The Grimoire",
    body: "Your saved Mirror readings—private, timestamped.",
  },
  {
    title: "Quiet Signals",
    body: "Optional weekly dispatch. No feed. No noise.",
  },
  {
    title: "Private Echoes",
    body: "Resonance is subtle—candles, roses, quiet proof of presence.",
  },
];

const faqs = [
  {
    question: "Is it really free?",
    answer: "Yes—joining is free; purchases are separate.",
  },
  {
    question: "How does Sanctuary pricing work?",
    answer: "Two prices appear. Members unlock the Sanctuary price.",
  },
  {
    question: "Do I have to buy anything?",
    answer: "No. Membership only opens access and pricing.",
  },
  {
    question: "What is The Mirror?",
    answer: "A private reflection and recommendation experience.",
  },
  {
    question: "When is checkout live?",
    answer: "Soon. Sanctuary members will be first to know.",
  },
];

export default function Join() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    console.log("Sanctuary signup:", email);
  };

  return (
    <>
      <Head>
        <title>Join the Sanctuary | Charmed & Dark</title>
        <meta
          name="description"
          content="Join free to unlock Sanctuary pricing, early access drops, and private Mirror readings."
        />
        <meta property="og:title" content="Join the Sanctuary | Charmed & Dark" />
        <meta
          property="og:description"
          content="Join free to unlock Sanctuary pricing, early access drops, and private Mirror readings."
        />
        <meta
          name="twitter:title"
          content="Join the Sanctuary | Charmed & Dark"
        />
        <meta
          name="twitter:description"
          content="Join free to unlock Sanctuary pricing, early access drops, and private Mirror readings."
        />
      </Head>

      <section className="space-y-12">
        <section className="space-y-5">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            JOIN THE SANCTUARY
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Step into the Circle.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-white/70">
            The world is loud. Your home should be quiet.
          </p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>10% off always (Sanctuary Price)</li>
            <li>Early access to Drops</li>
            <li>Keep your Mirror readings</li>
          </ul>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@darkhouse.com"
                className="w-full rounded-full border border-white/15 bg-black px-5 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                required
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Join Free
              </button>
              <a
                href="#member-benefits"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                See member benefits
              </a>
            </div>
            {submitted ? (
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                You’re in. Check your email soon.
              </p>
            ) : null}
          </form>
        </section>

        <section id="member-benefits" className="space-y-4">
          <h2 className="text-lg font-medium">Member Benefits</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-base font-medium">{benefit.title}</h3>
                <p className="mt-2 text-sm text-white/70">{benefit.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Join", body: "Enter an email. Step into the Circle." },
              {
                title: "Unlock",
                body: "Sanctuary pricing + private access appears across the site.",
              },
              {
                title: "Return",
                body: "Drops + Mirror readings create a daily ritual loop.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-base font-medium">{step.title}</h3>
                <p className="mt-2 text-sm text-white/70">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-lg font-medium">What you get</h2>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Sanctuary Price across the House</li>
              <li>Early access to Drops</li>
              <li>Saved Mirror readings in the Grimoire</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-medium">What we don’t do</h2>
            <ul className="space-y-2 text-sm text-white/70">
              <li>No spam, no loud promos</li>
              <li>No public posts, no performance</li>
              <li>No noisy feed or pressure to buy</li>
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">FAQ</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-base font-medium">{faq.question}</h3>
                <p className="mt-2 text-sm text-white/70">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">Join Free. Save 10% forever.</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@darkhouse.com"
                className="w-full rounded-full border border-white/15 bg-black px-5 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                required
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Join Free
            </button>
            <p className="text-xs text-white/50">
              No spam. Only drops and quiet signals.
            </p>
            {submitted ? (
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                You’re in. Check your email soon.
              </p>
            ) : null}
          </form>
        </section>
      </section>
    </>
  );
}
