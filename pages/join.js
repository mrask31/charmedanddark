import Head from "next/head";
import { useState } from "react";

const benefits = [
  {
    title: "Sanctuary Pricing",
    body: "Two prices appear across the House. Members unlock the Sanctuary Price automatically.",
  },
  {
    title: "Early Drop Windows",
    body: "Preview and access new drops before the Threshold opens to the public.",
  },
  {
    title: "The Grimoire",
    body: "Your saved Mirror readings—private, timestamped, and always yours.",
  },
  {
    title: "Quiet Signals",
    body: "Optional weekly dispatch. No feed. No noise. Only what matters.",
  },
  {
    title: "Private Echoes",
    body: "Resonance stays symbolic—candles, roses, and quiet proof of presence.",
  },
];

const faqs = [
  {
    question: "Is it really free?",
    answer: "Yes—joining is free. Purchases are separate.",
  },
  {
    question: "How does Sanctuary pricing work?",
    answer: "Two prices appear. Members unlock the Sanctuary Price automatically.",
  },
  {
    question: "Do I have to buy anything?",
    answer: "No. Membership simply unlocks access and pricing.",
  },
  {
    question: "What is The Mirror?",
    answer: "A private reflection and recommendation experience—quiet, personal, and on-brand.",
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
        <title>Join the Sanctuary | Charmed & Dark — Save 10% Forever</title>
        <meta
          name="description"
          content="Step into the Sanctuary at Charmed & Dark to unlock permanent 10% off, early access to Drops, and a private archive of your Mirror readings. Join free in seconds."
        />
        <meta property="og:title" content="Join the Sanctuary | Charmed & Dark" />
        <meta
          property="og:description"
          content="Step into the Sanctuary at Charmed & Dark to unlock permanent 10% off, early access to Drops, and a private archive of your Mirror readings. Join free in seconds."
        />
        <meta
          name="twitter:title"
          content="Join the Sanctuary | Charmed & Dark"
        />
        <meta
          name="twitter:description"
          content="Step into the Sanctuary at Charmed & Dark to unlock permanent 10% off, early access to Drops, and a private archive of your Mirror readings. Join free in seconds."
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
            <li>Early access windows before the Threshold opens</li>
            <li>Save your Mirror readings privately in your Grimoire</li>
          </ul>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              EMAIL
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@darkhouse.com"
                className="w-full rounded-full border border-white/15 bg-black px-5 py-3 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                required
              />
            </label>
            <p className="text-xs text-white/50">
              No spam. No noise. Only drops + quiet signals.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                Enter the Sanctuary
              </button>
              <a
                href="#member-benefits"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                See member benefits
              </a>
            </div>
            <p className="text-xs text-white/60">
              Free to join. Purchases are separate.
            </p>
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
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">
            The Circle grows quietly each night.
          </p>
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
          <p className="text-sm text-white/70">
            Your Circle entry is instant. You can leave anytime.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              EMAIL
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
              Enter the Sanctuary
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
