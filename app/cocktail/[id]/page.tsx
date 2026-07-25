import Link from "next/link";
import { notFound } from "next/navigation";
import RecipeDetails from "@/components/RecipeDetails";
import VoteButton from "@/components/VoteButton";
import ShareButtons from "@/components/ShareButtons";
import CreatorPack from "@/components/CreatorPack";
import RemixBar from "@/components/RemixBar";
import CocktailCard from "@/components/CocktailCard";
import MadeItPanel from "@/components/MadeItPanel";
import Comments from "@/components/Comments";
import { cocktailUrl } from "@/lib/site";
import {
  getCocktail,
  hasVoted,
  listComments,
  matchSponsoredBrand,
  findSimilarCocktails,
  getMakeStats,
} from "@/lib/repo";
import { getCurrentUser } from "@/lib/auth";
import { complianceNotesFor } from "@/lib/compliance";

export const dynamic = "force-dynamic";

export default async function CocktailDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cocktail = await getCocktail(params.id);
  if (!cocktail) notFound();

  const user = getCurrentUser();
  const [comments, voted, sponsor, similar, makeStats] = await Promise.all([
    listComments(cocktail.id),
    hasVoted(cocktail.id, user.id),
    matchSponsoredBrand(cocktail),
    findSimilarCocktails(cocktail, 3),
    getMakeStats(cocktail.id),
  ]);

  const compliance = complianceNotesFor(cocktail);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <Link href="/gallery" className="text-sm text-cocktail-plum/70 hover:underline">
        ← Back to gallery
      </Link>

      <article className="card overflow-hidden">
        {/* Hero image */}
        <div className="relative aspect-square bg-warm-gradient">
          {cocktail.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cocktail.image_url}
              alt={cocktail.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">
              🍸
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-cocktail-plum">
                {cocktail.name}
              </h1>
              <p className="mt-1 text-sm text-cocktail-ink/60">
                by @{cocktail.creator_username ?? "mixologist"} ·{" "}
                {new Date(cocktail.created_at).toLocaleDateString()}
              </p>
              {cocktail.remixed_from_name && (
                <p className="mt-1 text-sm text-cocktail-ink/60">
                  🔀 Remixed from{" "}
                  {cocktail.remixed_from_id ? (
                    <Link
                      href={`/cocktail/${cocktail.remixed_from_id}`}
                      className="underline"
                    >
                      {cocktail.remixed_from_name}
                    </Link>
                  ) : (
                    cocktail.remixed_from_name
                  )}
                  {cocktail.remixed_from_username
                    ? ` by @${cocktail.remixed_from_username}`
                    : ""}
                </p>
              )}
            </div>
            <VoteButton
              cocktailId={cocktail.id}
              initialCount={cocktail.vote_count}
              initialVoted={voted}
            />
          </div>

          <RecipeDetails recipe={cocktail} compliance={compliance} />

          {/* Made it — real photos + ratings + reviews (the trust moat). */}
          <MadeItPanel cocktailId={cocktail.id} initialStats={makeStats} />

          {/* Remix — the viral loop. Turn this drink into the next one. */}
          <RemixBar cocktailId={cocktail.id} />

          {/* Native sponsored placement — only shown for confirmed sponsors. */}
          {sponsor && (
            <aside className="rounded-2xl border border-cocktail-amber/40 bg-cocktail-amber/10 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cocktail-amber">
                <span>Sponsored</span>
              </div>
              <p className="mt-1 font-semibold text-cocktail-plum">
                {sponsor.name}
              </p>
              <p className="text-sm text-cocktail-ink/75">{sponsor.blurb}</p>
              {sponsor.cta_url && (
                <a
                  href={sponsor.cta_url}
                  target="_blank"
                  rel="noreferrer sponsored"
                  className="btn-secondary mt-2 !px-4 !py-2 text-sm"
                >
                  Learn more
                </a>
              )}
            </aside>
          )}

          <ShareButtons
            url={`/cocktail/${cocktail.id}`}
            title={cocktail.name}
            text={cocktail.tasting_notes}
          />

          {/* Social Creator Pack — clean image download + auto caption/hashtags. */}
          <CreatorPack
            recipe={cocktail}
            imageUrl={cocktail.image_url}
            link={cocktailUrl(cocktail.id)}
          />
        </div>
      </article>

      {similar.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-cocktail-plum">
            More like this 🧬
          </h2>
          <p className="-mt-2 text-sm text-cocktail-ink/60">
            Matched by flavour DNA.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((c) => (
              <CocktailCard key={c.id} cocktail={c} />
            ))}
          </div>
        </section>
      )}

      <Comments cocktailId={cocktail.id} initialComments={comments} />
    </div>
  );
}
