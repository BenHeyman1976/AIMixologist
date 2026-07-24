import { isShoppable, retailerLinks } from "@/lib/affiliates";

// "Shop the ingredients" — affiliate links to order each ingredient.
// Uses a native <details> element so it works without any client JS.
export default function ShopIngredients({
  ingredients,
}: {
  ingredients: string[];
}) {
  const shoppable = ingredients.filter(isShoppable);
  if (shoppable.length === 0) return null;

  return (
    <details className="rounded-2xl border border-cocktail-peach/40 bg-white">
      <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-cocktail-plum">
        🛒 Shop the ingredients
        <span className="ml-2 text-xs font-normal text-cocktail-ink/50">
          ({shoppable.length} items · affiliate links)
        </span>
      </summary>
      <div className="space-y-2 border-t border-cocktail-peach/30 px-4 py-3">
        {shoppable.map((ing, i) => (
          <div
            key={i}
            className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm text-cocktail-ink/85">{ing}</span>
            <div className="flex flex-wrap gap-1.5">
              {retailerLinks(ing).map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer sponsored nofollow"
                  className="chip hover:bg-cocktail-peach/40"
                >
                  {r.name}
                </a>
              ))}
            </div>
          </div>
        ))}
        <p className="pt-1 text-xs text-cocktail-ink/50">
          As an Amazon Associate we earn from qualifying purchases. We may earn a
          small commission from these links, at no extra cost to you. Please drink
          responsibly.
        </p>
      </div>
    </details>
  );
}
