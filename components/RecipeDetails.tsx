import type { GeneratedRecipe } from "@/lib/types";
import ShopIngredients from "@/components/ShopIngredients";
import { displayMeasure, type UnitSystem } from "@/lib/units";

// Presentational recipe body — reused on the create page and detail page.
export default function RecipeDetails({
  recipe,
  compliance = [],
  units = "ml",
}: {
  recipe: Pick<
    GeneratedRecipe,
    | "ingredients"
    | "method"
    | "garnish"
    | "glassware"
    | "tasting_notes"
    | "occasion"
    | "tags"
    | "description"
    | "abv"
    | "calories"
    | "prep_time"
    | "food_pairing"
    | "substitutions"
    | "allergens"
  >;
  compliance?: string[];
  units?: UnitSystem;
}) {
  const stats = [
    recipe.abv && { label: "ABV", value: recipe.abv },
    recipe.calories && { label: "Calories", value: recipe.calories },
    recipe.prep_time && { label: "Prep time", value: recipe.prep_time },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="space-y-6">
      {recipe.description && (
        <p className="text-cocktail-ink/80">{recipe.description}</p>
      )}

      {stats.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-cocktail-peach/20 px-4 py-2 text-center"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-cocktail-plum/60">
                {s.label}
              </div>
              <div className="font-bold text-cocktail-plum">{s.value}</div>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-lg font-bold text-cocktail-plum">
            Ingredients
          </h3>
          <ul className="mt-2 space-y-1 text-cocktail-ink/85">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-cocktail-coral">•</span>
                <span>{displayMeasure(ing, units)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-cocktail-plum">
            Method
          </h3>
          <ol className="mt-2 space-y-1 text-cocktail-ink/85">
            {recipe.method.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-semibold text-cocktail-coral">{i + 1}.</span>
                <span>{displayMeasure(step, units)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ShopIngredients ingredients={recipe.ingredients} />

      <div className="grid gap-4 sm:grid-cols-3 text-sm">
        <Fact label="Garnish" value={recipe.garnish} />
        <Fact label="Glassware" value={recipe.glassware} />
        <Fact label="Occasion" value={recipe.occasion} />
      </div>

      <div>
        <h3 className="font-display text-lg font-bold text-cocktail-plum">
          Tasting notes
        </h3>
        <p className="mt-1 italic text-cocktail-ink/80">{recipe.tasting_notes}</p>
      </div>

      {recipe.food_pairing && (
        <p className="text-cocktail-ink/80">
          <span className="font-semibold text-cocktail-plum">🍽️ Pairs with:</span>{" "}
          {recipe.food_pairing}
        </p>
      )}

      {recipe.substitutions && recipe.substitutions.length > 0 && (
        <div>
          <h3 className="font-display text-lg font-bold text-cocktail-plum">
            Easy swaps
          </h3>
          <ul className="mt-2 space-y-1 text-cocktail-ink/85">
            {recipe.substitutions.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-cocktail-coral">↔</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recipe.allergens && recipe.allergens.length > 0 && (
        <p className="text-sm text-cocktail-plum">
          <span className="font-semibold">Allergens:</span>{" "}
          {recipe.allergens.join(", ")}
        </p>
      )}

      {recipe.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((t) => (
            <span key={t} className="chip">
              #{t}
            </span>
          ))}
        </div>
      )}

      {compliance.length > 0 && (
        <div className="rounded-2xl border border-cocktail-amber/40 bg-cocktail-amber/10 p-4 text-sm text-cocktail-plum">
          {compliance.map((note, i) => (
            <p key={i} className="flex gap-2">
              <span>⚠️</span>
              <span>{note}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl bg-cocktail-cream p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-cocktail-ink/50">
        {label}
      </div>
      <div className="mt-1 text-cocktail-ink/85">{value}</div>
    </div>
  );
}
