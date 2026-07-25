import type { FlavourProfile, GeneratedRecipe } from "@/lib/types";
import { DNA_AXES, dnaHeadline, flavourProfileFor } from "@/lib/dna";

// Cocktail DNA — a compact six-bar flavour fingerprint. Pure CSS bars (no chart
// library) so it stays light and renders identically on server and client.
export default function FlavourDNA({
  recipe,
}: {
  recipe: Pick<
    GeneratedRecipe,
    "ingredients" | "tags" | "tasting_notes" | "alcohol_level" | "name" | "flavour_profile"
  >;
}) {
  const profile: FlavourProfile = flavourProfileFor(recipe);

  return (
    <div className="rounded-2xl border border-cocktail-peach/40 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg font-bold text-cocktail-plum">
          Cocktail DNA 🧬
        </h3>
        <span className="text-sm font-semibold text-cocktail-coral">
          {dnaHeadline(profile)}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {DNA_AXES.map((axis) => {
          const value = profile[axis.key];
          const pct = (value / 5) * 100;
          return (
            <div key={axis.key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm text-cocktail-ink/70">
                {axis.emoji} {axis.label}
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cocktail-peach/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cocktail-peach to-cocktail-coral"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs font-semibold text-cocktail-plum/60">
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
