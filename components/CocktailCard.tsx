import Link from "next/link";
import type { Cocktail } from "@/lib/types";

const ALCOHOL_LABELS: Record<string, string> = {
  "alcohol-free": "Alcohol-free",
  "low-alcohol": "Low-alcohol",
  "full-strength": "Full-strength",
};

// Instagram-style shareable card for the gallery grid. The generated image
// is the hero.
export default function CocktailCard({ cocktail }: { cocktail: Cocktail }) {
  return (
    <Link
      href={`/cocktail/${cocktail.id}`}
      className="card group block transition hover:-translate-y-1"
    >
      <div className="relative aspect-square bg-warm-gradient">
        {cocktail.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cocktail.image_url}
            alt={cocktail.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            🍸
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="chip bg-white/85 backdrop-blur">
            {ALCOHOL_LABELS[cocktail.alcohol_level] ?? cocktail.alcohol_level}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 chip bg-black/55 text-white backdrop-blur">
          ❤️ {cocktail.vote_count}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-cocktail-plum leading-tight">
          {cocktail.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-cocktail-ink/70">
          {cocktail.tasting_notes}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-cocktail-ink/60">
          <span>@{cocktail.creator_username ?? "mixologist"}</span>
          <span>{cocktail.occasion}</span>
        </div>
      </div>
    </Link>
  );
}
