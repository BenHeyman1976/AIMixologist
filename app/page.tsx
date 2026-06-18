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
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="mb-3 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white backdrop-blur">
              🍹 Community-driven AI cocktail creator
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white sm:text-6xl">
              Turn any idea into a stunning cocktail.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/90">
              Describe a mood, a flavour, a brand or an occasion. Bob crafts the
              recipe, generates a marketing-ready image, and shares it with the
              community.
            </p>
            <div className="mt-8">
              <HomePrompt />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "✨",
              title: "Describe it",
              body: "Type any idea — “tropical for a BBQ”, a brand, a mood. Unlimited free recipes.",
            },
            {
              icon: "🖼️",
              title: "Picture it",
              body: "Generate a premium lifestyle image. The image is the hero of every card.",
            },
            {
              icon: "🌍",
              title: "Share it",
              body: "Publish to the gallery. Get likes, votes and comments from the community.",
            },
          ].map((s) => (
            <div key={s.title} className="card p-6">
              <div className="text-3xl">{s.icon}</div>
              <h3 className="mt-3 font-display text-xl font-bold text-cocktail-plum">
                {s.title}
              </h3>
              <p className="mt-2 text-cocktail-ink/70">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
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
    </div>
  );
}
