import Link from "next/link";
import CocktailCard from "@/components/CocktailCard";
import { getCurrentUser } from "@/lib/auth";
import { getImageUsage, listUserCocktails } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const [{ saved, published }, usage] = await Promise.all([
    listUserCocktails(user.id),
    getImageUsage(user.id),
  ]);

  const pct = usage.limit > 0 ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-gradient text-2xl">
            🍹
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-cocktail-plum">
              @{user.username}
            </h1>
            <p className="text-sm text-cocktail-ink/60 capitalize">
              {user.plan} plan
            </p>
          </div>
        </div>
        <Link href="/create" className="btn-primary text-sm self-start">
          Create new 🍹
        </Link>
      </div>

      {/* Image allowance */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-cocktail-plum">
            Monthly image allowance
          </h2>
          <span className="text-sm font-semibold text-cocktail-plum">
            {usage.used} / {usage.limit} used
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-cocktail-peach/20">
          <div
            className="h-full rounded-full bg-warm-gradient transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-cocktail-ink/60">
          {usage.remaining} generations left this month ({usage.period}).
          Recipes are always unlimited.
        </p>
        {/* TODO(billing): add an "Upgrade" CTA → Stripe checkout for the paid
            plan, which raises this monthly allowance. */}
        <button className="btn-secondary mt-4 text-sm" disabled>
          Upgrade for more images (coming soon)
        </button>
      </div>

      {/* Published */}
      <Section
        title="Published to community"
        empty="You haven't published any cocktails yet."
        cocktails={published}
      />

      {/* Saved */}
      <Section
        title="Saved cocktails"
        empty="No saved cocktails yet — create your first one!"
        cocktails={saved}
      />
    </div>
  );
}

function Section({
  title,
  empty,
  cocktails,
}: {
  title: string;
  empty: string;
  cocktails: Awaited<ReturnType<typeof listUserCocktails>>["saved"];
}) {
  return (
    <section>
      <h2 className="mb-4 font-display text-xl font-bold text-cocktail-plum">
        {title} ({cocktails.length})
      </h2>
      {cocktails.length === 0 ? (
        <p className="text-cocktail-ink/60">{empty}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cocktails.map((c) => (
            <CocktailCard key={c.id} cocktail={c} />
          ))}
        </div>
      )}
    </section>
  );
}
