"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import RecipeDetails from "@/components/RecipeDetails";
import ShareButtons from "@/components/ShareButtons";
import CreatorPack from "@/components/CreatorPack";
import MicButton from "@/components/MicButton";
import { displayMeasure } from "@/lib/units";
import type { Cocktail, GeneratedRecipe, ImageUsage } from "@/lib/types";

export interface RemixContext {
  baseId: string;
  baseName: string;
  baseUsername: string | null;
  presetKey: string | null;
  instruction: string | null;
  twistLabel: string;
}

// The creation studio: prompt → recipe → image → save → publish → share.
export default function CreateStudio({
  initialPrompt = "",
  remix,
  pantry,
}: {
  initialPrompt?: string;
  remix?: RemixContext;
  pantry?: { have: string[] };
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [compliance, setCompliance] = useState<string[]>([]);
  const [pantryMatch, setPantryMatch] = useState<{ have: string[]; missing: string[] } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState<Cocktail | null>(null);
  const [usage, setUsage] = useState<ImageUsage | null>(null);

  const [genLoading, setGenLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pubLoading, setPubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Measurement preference — defaults to ml (UK/metric), remembered per browser.
  const [units, setUnits] = useState<"ml" | "oz">("ml");
  useEffect(() => {
    const saved = window.localStorage.getItem("siply_units");
    if (saved === "oz" || saved === "ml") setUnits(saved);
  }, []);
  function changeUnits(u: "ml" | "oz") {
    setUnits(u);
    window.localStorage.setItem("siply_units", u);
  }

  // When the user arrives with an idea already typed (from the home hero) or a
  // remix context (from a cocktail page), generate straight away — no second
  // click. The ref guard stops React's dev StrictMode from firing it twice.
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    if (remix) {
      autoRan.current = true;
      remixRecipe();
    } else if (pantry && pantry.have.length > 0) {
      autoRan.current = true;
      pantryRecipe();
    } else if (initialPrompt.trim().length >= 3) {
      autoRan.current = true;
      generateRecipe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pantryRecipe() {
    if (!pantry) return;
    setGenLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ have: pantry.have }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecipe(data.recipe);
      setCompliance(data.compliance ?? []);
      setPantryMatch(data.match ?? null);
      setSaved(null);
      setImageUrl(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to build a cocktail.");
    } finally {
      setGenLoading(false);
    }
  }

  async function remixRecipe() {
    if (!remix) return;
    setGenLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseId: remix.baseId,
          preset: remix.presetKey ?? undefined,
          instruction: remix.instruction ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecipe(data.recipe);
      setCompliance(data.compliance ?? []);
      setSaved(null);
      setImageUrl(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to remix cocktail.");
    } finally {
      setGenLoading(false);
    }
  }

  // Bring the recipe into view the moment it appears, so it's obvious the
  // generation worked (no "did anything happen?" scroll hunting).
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (recipe) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [recipe]);

  async function generateRecipe() {
    if (prompt.trim().length < 3) return;
    setGenLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, units }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecipe(data.recipe);
      setCompliance(data.compliance ?? []);
      // A re-generation invalidates a previously saved/imaged cocktail.
      setSaved(null);
      setImageUrl(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to generate recipe.");
    } finally {
      setGenLoading(false);
    }
  }

  async function generateImage() {
    if (!recipe) return;
    setImgLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: recipe.name,
          prompt,
          ingredients: recipe.ingredients,
          garnish: recipe.garnish,
          glassware: recipe.glassware,
          tasting_notes: recipe.tasting_notes,
          occasion: recipe.occasion,
          cocktailId: saved?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.usage) setUsage(data.usage);
        throw new Error(data.error);
      }
      setImageUrl(data.image_url);
      setUsage(data.usage);
    } catch (err: any) {
      setError(err.message ?? "Failed to generate image.");
    } finally {
      setImgLoading(false);
    }
  }

  async function save() {
    if (!recipe) return;
    setSaveLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cocktails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, recipe, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(data.cocktail);
    } catch (err: any) {
      setError(err.message ?? "Failed to save cocktail.");
    } finally {
      setSaveLoading(false);
    }
  }

  async function publish() {
    let cocktail = saved;
    setPubLoading(true);
    setError(null);
    try {
      // Save first if not yet saved.
      if (!cocktail) {
        const res = await fetch("/api/cocktails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, recipe, imageUrl, isPublic: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        cocktail = data.cocktail;
      } else {
        const res = await fetch(`/api/cocktails/${cocktail.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublic: true, imageUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        cocktail = data.cocktail;
      }
      setSaved(cocktail);
    } catch (err: any) {
      setError(err.message ?? "Failed to publish cocktail.");
    } finally {
      setPubLoading(false);
    }
  }

  const shareUrl =
    saved && typeof window !== "undefined"
      ? `${window.location.origin}/cocktail/${saved.id}`
      : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-cocktail-plum">
          {remix ? "Remix a cocktail" : pantry ? "From your bar" : "Create a cocktail"}
        </h1>
        {pantry ? (
          <p className="mt-1 text-cocktail-ink/70">
            Built from what you've got in:{" "}
            <span className="font-semibold text-cocktail-plum">
              {pantry.have.join(", ")}
            </span>
            .
          </p>
        ) : remix ? (
          <p className="mt-1 text-cocktail-ink/70">
            <span className="font-semibold text-cocktail-coral">{remix.twistLabel}</span>{" "}
            — based on{" "}
            <Link href={`/cocktail/${remix.baseId}`} className="underline">
              {remix.baseName}
            </Link>
            {remix.baseUsername ? ` by @${remix.baseUsername}` : ""}.
          </p>
        ) : (
          <p className="mt-1 text-cocktail-ink/70">
            Describe your idea. Iterate as many times as you like — recipes are
            unlimited and free.
          </p>
        )}
        {/* Measurement preference */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm font-semibold text-cocktail-ink/60">
            Measures:
          </span>
          <div className="inline-flex rounded-full bg-white p-1 shadow-sm">
            {(["ml", "oz"] as const).map((u) => (
              <button
                key={u}
                onClick={() => changeUnits(u)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  units === u
                    ? "bg-cocktail-coral text-white"
                    : "text-cocktail-plum hover:bg-cocktail-cream"
                }`}
              >
                {u === "ml" ? "ml (metric)" : "oz (US)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Initial prompt — shown only until the first recipe exists (and not
          while a remix is auto-generating). */}
      {!recipe && !genLoading && (
        <div className="card p-5 space-y-3">
          <textarea
            className="input min-h-[110px] text-lg"
            placeholder="e.g. Create a relaxing Aperol and Trip CBD spritz for summer"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={generateRecipe}
              disabled={genLoading || prompt.trim().length < 3}
              className="btn-primary"
            >
              {genLoading ? "Mixing your cocktail…" : "Generate recipe 🍹"}
            </button>
            <MicButton
              onResult={(t) => setPrompt((p) => (p ? `${p} ${t}` : t))}
              title="Say your cocktail idea"
            />
            <span className="text-sm text-cocktail-ink/50">or tap 🎤 to speak</span>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-cocktail-coral/10 border border-cocktail-coral/40 p-4 text-cocktail-coral">
          {error}
        </div>
      )}

      {/* Big, obvious loading state while the first recipe is being made. */}
      {genLoading && !recipe && (
        <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center">
          <span className="text-5xl animate-bounce">🍹</span>
          <p className="font-display text-xl font-bold text-cocktail-plum">
            Siply is shaking things up…
          </p>
          <p className="text-sm text-cocktail-ink/60">
            {remix ? `${remix.twistLabel}…` : "Crafting your recipe"}
          </p>
        </div>
      )}

      {/* Result — shown first so it's the first thing you see. */}
      {recipe && (
        <div ref={resultRef} className="card overflow-hidden scroll-mt-20">
          {/* Hero image — square to match generated images (full glass shows) */}
          <div className="relative aspect-square bg-warm-gradient">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={recipe.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-white">
                <span className="text-6xl">🍸</span>
                <span className="mt-2 text-sm text-white/80">
                  Generate an image to bring it to life
                </span>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-cocktail-plum">
                {recipe.name}
              </h2>
              {recipe.remixed_from_name && (
                <p className="mt-1 text-sm text-cocktail-ink/60">
                  🔀 Remixed from{" "}
                  {recipe.remixed_from_id ? (
                    <Link
                      href={`/cocktail/${recipe.remixed_from_id}`}
                      className="underline"
                    >
                      {recipe.remixed_from_name}
                    </Link>
                  ) : (
                    recipe.remixed_from_name
                  )}
                  {recipe.remixed_from_username ? ` by @${recipe.remixed_from_username}` : ""}
                </p>
              )}
            </div>

            {/* Pantry match — what you already have vs what to grab. */}
            {pantryMatch && (
              <div className="rounded-2xl border border-cocktail-peach/40 bg-cocktail-cream/60 p-4 text-sm">
                {pantryMatch.missing.length === 0 ? (
                  <p className="font-semibold text-cocktail-plum">
                    🎉 You've got everything you need — go make it!
                  </p>
                ) : (
                  <>
                    <p className="font-semibold text-cocktail-plum">
                      You're almost there — grab {pantryMatch.missing.length}{" "}
                      more:
                    </p>
                    <ul className="mt-2 space-y-1 text-cocktail-ink/85">
                      {pantryMatch.missing.map((m, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-cocktail-coral">＋</span>
                          <span>{displayMeasure(m, units)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {pantryMatch.have.length > 0 && (
                  <p className="mt-2 text-cocktail-ink/55">
                    Using from your bar: {pantryMatch.have.length} ingredient
                    {pantryMatch.have.length === 1 ? "" : "s"} ✓
                  </p>
                )}
              </div>
            )}

            <RecipeDetails recipe={recipe} compliance={compliance} units={units} />

            {/* Image usage meter */}
            {usage && (
              <p className="text-sm text-cocktail-ink/60">
                Image generations this month: {usage.used}/{usage.limit}{" "}
                ({usage.remaining} left)
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 border-t border-cocktail-peach/30 pt-5">
              <button onClick={save} disabled={saveLoading} className="btn-secondary">
                {saveLoading ? "Saving…" : saved ? "Saved ✓" : "Save"}
              </button>
              <button onClick={generateImage} disabled={imgLoading} className="btn-secondary">
                {imgLoading ? "Generating image…" : "Generate image 🖼️"}
              </button>
              <button onClick={publish} disabled={pubLoading} className="btn-primary">
                {pubLoading
                  ? "Publishing…"
                  : saved?.is_public
                  ? "Published ✓"
                  : "Publish to community 🌍"}
              </button>
            </div>

            {/* Share + view (after publish) */}
            {saved?.is_public && (
              <div className="space-y-3 rounded-2xl bg-cocktail-cream p-4">
                <p className="font-semibold text-cocktail-plum">
                  🎉 Live in the gallery!{" "}
                  <Link href={`/cocktail/${saved.id}`} className="underline">
                    View it
                  </Link>
                </p>
                <ShareButtons
                  url={shareUrl}
                  title={recipe.name}
                  text={recipe.tasting_notes}
                />
              </div>
            )}

            {/* Social Creator Pack — clean image + caption + hashtags. Shown
                once there's something worth posting (image or published link). */}
            {(imageUrl || saved?.is_public) && (
              <CreatorPack
                recipe={recipe}
                imageUrl={imageUrl}
                link={saved?.is_public ? shareUrl : undefined}
              />
            )}
          </div>
        </div>
      )}

      {/* Tweak & regenerate — placed BELOW the recipe so you read the result
          first. Drunk-proof: the result is front and centre, tweaking is a
          deliberate scroll-down action. */}
      {recipe && (
        <div className="card p-5 space-y-3">
          <h3 className="font-display text-lg font-bold text-cocktail-plum">
            Not quite right? Tweak it 🔄
          </h3>
          <textarea
            className="input min-h-[90px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={generateRecipe}
              disabled={genLoading || prompt.trim().length < 3}
              className="btn-secondary"
            >
              {genLoading ? "Mixing…" : "Regenerate 🔄"}
            </button>
            <MicButton
              onResult={(t) => setPrompt((p) => (p ? `${p} ${t}` : t))}
              title="Say your changes"
            />
          </div>
        </div>
      )}
    </div>
  );
}
