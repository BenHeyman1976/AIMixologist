"use client";

import { useMemo, useState } from "react";
import { buildCreatorCopy, type Platform } from "@/lib/social";
import type { GeneratedRecipe } from "@/lib/types";

// The Social Creator Pack: everything a user needs to post their cocktail to
// TikTok / Instagram / Pinterest — a clean (watermark-free) image download plus
// auto-generated caption + hashtags. Brand credit rides on the hashtags, not on
// the picture.
export default function CreatorPack({
  recipe,
  imageUrl,
  link,
}: {
  recipe: Pick<
    GeneratedRecipe,
    | "name"
    | "description"
    | "tasting_notes"
    | "occasion"
    | "tags"
    | "alcohol_level"
    | "ingredients"
    | "garnish"
  >;
  imageUrl?: string | null;
  link?: string;
}) {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [copied, setCopied] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const copy = useMemo(
    () => buildCreatorCopy(recipe, platform, link),
    [recipe, platform, link]
  );

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  async function downloadImage() {
    if (!imageUrl) return;
    setDownloading(true);
    const filename = `${slug(recipe.name)}-siply.png`;
    try {
      // Fetch → blob so it saves rather than navigating away.
      const res = await fetch(imageUrl, { mode: "cors" });
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, filename);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Cross-origin fetch blocked — fall back to a direct link/new tab.
      triggerDownload(imageUrl, filename, true);
    } finally {
      setDownloading(false);
    }
  }

  async function shareNative() {
    const shareData: ShareData = {
      title: recipe.name,
      text: copy.full,
      ...(link ? { url: link } : {}),
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* cancelled */
      }
    } else {
      copyText("full", copy.full);
    }
  }

  const platforms: { key: Platform; label: string; emoji: string }[] = [
    { key: "instagram", label: "Instagram", emoji: "📸" },
    { key: "tiktok", label: "TikTok", emoji: "🎵" },
    { key: "pinterest", label: "Pinterest", emoji: "📌" },
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-cocktail-peach/40 bg-white p-5">
      <div>
        <h3 className="font-display text-lg font-bold text-cocktail-plum">
          Share it everywhere ✨
        </h3>
        <p className="text-sm text-cocktail-ink/60">
          Grab your image and a ready-made caption. Post it as-is — the hashtags
          do the crediting, so your photo stays clean.
        </p>
      </div>

      {/* Platform picker — swaps the caption style + hashtag mix. */}
      <div className="inline-flex flex-wrap gap-1 rounded-full bg-cocktail-cream p-1">
        {platforms.map((p) => (
          <button
            key={p.key}
            onClick={() => setPlatform(p.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              platform === p.key
                ? "bg-cocktail-coral text-white"
                : "text-cocktail-plum hover:bg-white"
            }`}
          >
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      {/* Image download + native share */}
      <div className="flex flex-wrap gap-2">
        {imageUrl ? (
          <button
            onClick={downloadImage}
            disabled={downloading}
            className="btn-secondary !px-4 !py-2 text-sm"
          >
            {downloading ? "Preparing…" : "⬇️ Download image"}
          </button>
        ) : (
          <span className="text-sm text-cocktail-ink/50">
            Generate an image first to include a photo.
          </span>
        )}
        <button
          onClick={shareNative}
          className="btn-secondary !px-4 !py-2 text-sm"
        >
          📲 Share…
        </button>
      </div>

      {/* Caption */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-cocktail-plum/60">
            Caption
          </span>
          <button
            onClick={() => copyText("caption", copy.caption)}
            className="btn-ghost !px-3 !py-1 text-xs"
          >
            {copied === "caption" ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="whitespace-pre-wrap rounded-xl bg-cocktail-cream p-3 text-sm text-cocktail-ink/85 font-sans">
          {copy.caption}
        </pre>
      </div>

      {/* Hashtags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-cocktail-plum/60">
            Hashtags ({copy.hashtags.length})
          </span>
          <button
            onClick={() => copyText("tags", copy.hashtagLine)}
            className="btn-ghost !px-3 !py-1 text-xs"
          >
            {copied === "tags" ? "Copied!" : "Copy"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {copy.hashtags.map((t) => (
            <span key={t} className="chip">
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Copy everything */}
      <button
        onClick={() => copyText("full", copy.full)}
        className="btn-primary w-full !py-2.5 text-sm"
      >
        {copied === "full" ? "Copied caption + hashtags ✓" : "Copy caption + hashtags 📋"}
      </button>
    </div>
  );
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cocktail";
}

function triggerDownload(url: string, filename: string, newTab = false) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  if (newTab) a.target = "_blank";
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
