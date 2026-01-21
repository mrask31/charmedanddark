import Head from "next/head";
import Link from "next/link";

export default function About() {
  return (
    <>
      <Head>
        <title>About Charmed & Dark | Gothic Home Decor & Apparel Boutique</title>
        <meta
          name="description"
          content="Charmed & Dark is an elegant gothic boutique for modern ritual—offering gothic home decor, apparel, and a private Sanctuary experience designed for quiet, beauty, and belonging."
        />
        <meta
          property="og:title"
          content="About Charmed & Dark | Gothic Home Decor & Apparel Boutique"
        />
        <meta
          property="og:description"
          content="Charmed & Dark is an elegant gothic boutique for modern ritual—offering gothic home decor, apparel, and a private Sanctuary experience designed for quiet, beauty, and belonging."
        />
      </Head>
      <section className="space-y-12">
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            ABOUT THE HOUSE
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Charmed & Dark
          </h1>
          <p className="max-w-2xl text-base leading-7 text-white/70">
            A boutique for the modern shadow—crafted for quiet, beauty, and
            ritual.
          </p>
        </section>

        <div className="h-px bg-white/10" />

        <section className="space-y-3">
          <h2 className="text-lg font-medium">The world is loud.</h2>
          <p className="text-sm leading-6 text-white/70">
            We live in a time of constant brightness—endless noise, endless
            performance, endless demand to be “fine.” Charmed & Dark was created
            for those who move through that world, then come home and finally
            exhale. Not to escape life. To return to yourself.
          </p>
        </section>

        <div className="h-px bg-white/10" />

        <section className="space-y-4">
          <h2 className="text-lg font-medium">What we create</h2>
          <p className="text-sm text-white/70">
            Charmed & Dark is an elegant gothic boutique offering two forms of
            refuge:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-medium">Apparel — The Uniform</h3>
              <p className="mt-2 text-sm text-white/70">
                Pieces designed for presence. Clean silhouettes. Dark restraint.
                Comfort that holds its shape. Not costume—identity.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-medium">Home Décor — The Ritual</h3>
              <p className="mt-2 text-sm text-white/70">
                Objects that shift the atmosphere of a room. Candles. Dark
                glass. Soft textures. Quiet details. Not clutter—intention.
              </p>
            </div>
          </div>
        </section>

        <div className="h-px bg-white/10" />

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Two realms. One House.</h2>
          <p className="text-sm leading-6 text-white/70">
            The House is built in two parts: The Threshold — The public
            world—where anyone can browse, discover, and shop. The Sanctuary — A
            private space for members—calm, personal, and designed to be
            returned to. No noise. No feeds. No performance. Only presence.
          </p>
        </section>

        <div className="h-px bg-white/10" />

        <section className="space-y-3">
          <h2 className="text-lg font-medium">The Mirror</h2>
          <p className="text-sm leading-6 text-white/70">
            The Mirror is our private reflection experience—an elegant gothic
            companion that responds to your mood with quiet clarity. It isn’t
            here to entertain you. It’s here to witness you. Sometimes, it
            offers words. Sometimes, it offers a piece from the House that fits
            what you’re carrying.
          </p>
        </section>

        <div className="h-px bg-white/10" />

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Drops, sealed in time</h2>
          <p className="text-sm leading-6 text-white/70">
            We release limited drops in small runs—curated capsules of apparel
            and home décor that arrive quietly and disappear just as cleanly.
            When a drop closes, it may never return the same way.
          </p>
        </section>

        <div className="h-px bg-white/10" />

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Who the House is for</h2>
          <p className="text-sm leading-6 text-white/70">
            Charmed & Dark is for those who live in two worlds: The polished
            world people expect. And the private world you protect. For the ones
            who feel deeply, speak softly, and still carry power. For the modern
            shadow.
          </p>
        </section>

        <div className="h-px bg-white/10" />

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-medium">An invitation</h2>
          <p className="text-sm leading-6 text-white/70">
            You don’t have to be loud to be unforgettable. You don’t have to
            explain your darkness to deserve softness. Enter when you’re ready.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/80 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Shop the House
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Enter the Sanctuary
            </Link>
          </div>
        </section>
      </section>
    </>
  );
}
