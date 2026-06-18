import Link from "next/link";
import CocktailCard from "@/components/CocktailCard";
import { listPublicCocktails, type GalleryFilters } from "@/lib/repo";
import type { GallerySort } from "@/lib/types";

export const dynamic = "force-dynamic";

const SORTS: { key: GallerySort; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "newest", label: "Newest" },
  { key: "most_voted", label: "Most voted" },
];

const ALCOHOL_FILTERS = [
  { key: "", label: "All" },
  { key: "low-alcohol", label: "Low-alcohol" },
  { key: "alcohol-free", label: "Alcohol-free" },
  { key: "full-strength", label: "Full-strength" },
];

const SPIRIT_FILTERS = ["gin", "rum", "vodka", "tequila", "whisky", "aperol"];
const MOOD_FILTERS = ["tropical", "festive", "wellness", "refreshing"];

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const sort = (searchParams.sort as GallerySort) ?? "trending";
  const filters: GalleryFilters = {
    sort,
    alcohol: searchParams.alcohol || undefined,
    spirit: searchParams.spirit || undefined,
    mood: searchParams.mood || undefined,
    occasion: searchParams.occasion || undefined,
  };
  const cocktails = await listPublicCocktails(filters);

  // Helper to build a URL preserving existing params.
  const buildHref = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries({ ...searchParams, ...patch }).forEach(([k, v]) => {
      if (v) params.set(k, v as string);
    });
    return `/gallery?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-cocktail-plum">
            Community gallery
          </h1>
          <p className="mt-1 text-cocktail-ink/70">
            Discover cocktails created and voted on by the community.
          </p>
        </div>
        <Link href="/create" className="btn-primary text-sm self-start">
          Create your own 🍹
        </Link>
      </div>

      {/* Sort */}
      <div className="mt-6 flex flex-wrap gap-2">
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={buildHref({ sort: s.key })}
            className={`chip ${
              sort === s.key ? "!bg-cocktail-plum !text-white" : ""
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 space-y-3 rounded-2xl bg-white/60 p-4">
        <FilterRow label="Style">
          {ALCOHOL_FILTERS.map((f) => (
            <Link
              key={f.label}
              href={buildHref({ alcohol: f.key })}
              className={`chip ${
                (searchParams.alcohol ?? "") === f.key
                  ? "!bg-cocktail-coral !text-white"
                  : ""
              }`}
            >
              {f.label}
            </Link>
          ))}
        </FilterRow>
        <FilterRow label="Spirit">
          {SPIRIT_FILTERS.map((s) => (
            <Link
              key={s}
              href={buildHref({ spirit: searchParams.spirit === s ? "" : s })}
              className={`chip ${
                searchParams.spirit === s ? "!bg-cocktail-coral !text-white" : ""
              }`}
            >
              {s}
            </Link>
          ))}
        </FilterRow>
        <FilterRow label="Mood">
          {MOOD_FILTERS.map((m) => (
            <Link
              key={m}
              href={buildHref({ mood: searchParams.mood === m ? "" : m })}
              className={`chip ${
                searchParams.mood === m ? "!bg-cocktail-coral !text-white" : ""
              }`}
            >
              {m}
            </Link>
          ))}
        </FilterRow>
      </div>

      {/* Grid */}
      <div className="mt-8">
        {cocktails.length === 0 ? (
          <p className="text-cocktail-ink/60">
            No cocktails match these filters yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {cocktails.map((c) => (
              <CocktailCard key={c.id} cocktail={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 text-xs font-semibold uppercase tracking-wide text-cocktail-ink/50">
        {label}
      </span>
      {children}
    </div>
  );
}
