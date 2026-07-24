import Link from "next/link";
import HomePrompt from "@/components/HomePrompt";
import CocktailCard from "@/components/CocktailCard";
import { listPublicCocktails } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const trending = (await listPublicCocktails({ sort: "trending" })).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-warm-gradient">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <p className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white backdrop-blur">
            🍸 Your cocktail concierge
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-6xl">
            Imagine. Create. Enjoy.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
            Describe any mood, flavour or occasion — Siply crafts the cocktail,
            generates a gorgeous image, and plans your whole night. At home, and out.
          </p>
          <div className="mt-8 flex justify-center">
            <HomePrompt />
          </div>
          <p className="mt-4 text-sm text-white/70">
            Free to use · No sign-up to try · Please drink responsibly
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-display text-3xl font-bold text-cocktail-plum">
          Your night, sorted in seconds
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "✨",
              title: "Imagine",
              body: "Type any idea — “low-alcohol summer spritz”, a vibe, an occasion. Unlimited free recipes.",
            },
            {
              icon: "🖼️",
              title: "Create",
              body: "Generate a stunning, share-ready cocktail image. The picture is the hero of every card.",
            },
            {
              icon: "🥂",
              title: "Enjoy",
              body: "Plan a paced night out, show the barman how to make it, or share the shopping list for a night in.",
            },
          ].map((s) => (
            <div key={s.title} className="card p-6 text-center">
              <div className="text-4xl">{s.icon}</div>
              <h3 className="mt-3 font-display text-xl font-bold text-cocktail-plum">
                {s.title}
              </h3>
              <p className="mt-2 text-cocktail-ink/70">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-cocktail-plum">
            Trending in the community
          </h2>
          <Link href="/gallery" className="btn-ghost text-sm">
            Browse all →
          </Link>
        </div>
        {trending.length === 0 ? (
          <p className="text-cocktail-ink/60">
            No cocktails yet — be the first to{" "}
            <Link href="/create" className="underline">
              create one
            </Link>
            !
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {trending.map((c) => (
              <CocktailCard key={c.id} cocktail={c} />
            ))}
          </div>
        )}
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-8">
        <div className="card bg-warm-gradient p-10 text-center sm:p-14">
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Ready to make something beautiful?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-white/90">
            Create your first cocktail free — no sign-up needed. Share it, get
            voted up, and build your collection.
          </p>
          <Link
            href="/create"
            className="mt-6 inline-block rounded-full bg-white px-8 py-4 font-bold text-cocktail-plum shadow-card transition hover:scale-[1.02]"
          >
            Create your cocktail 🍸
          </Link>
        </div>
      </section>
    </div>
  );
}
