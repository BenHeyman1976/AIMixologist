"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REMIX_PRESETS } from "@/lib/remix";

// One-tap remix controls shown on a cocktail. Each button (or the free-text
// box) sends the user into the create studio with the remix pre-loaded, so the
// whole save / image / publish / share flow is reused. This is the viral loop:
// every cocktail is a launchpad for the next one.
export default function RemixBar({ cocktailId }: { cocktailId: string }) {
  const router = useRouter();
  const [custom, setCustom] = useState("");

  function go(params: Record<string, string>) {
    const q = new URLSearchParams({ remixOf: cocktailId, ...params });
    router.push(`/create?${q.toString()}`);
  }

  return (
    <div className="space-y-3 rounded-2xl border border-cocktail-peach/40 bg-cocktail-cream/60 p-5">
      <div>
        <h3 className="font-display text-lg font-bold text-cocktail-plum">
          Remix this cocktail 🔀
        </h3>
        <p className="text-sm text-cocktail-ink/60">
          Make it yours in one tap — we'll spin up a new version and credit the
          original.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {REMIX_PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => go({ twist: p.key })}
            className="btn-secondary !px-4 !py-2 text-sm"
          >
            {p.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim().length >= 2) go({ instruction: custom.trim() });
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          className="input flex-1"
          placeholder="…or describe your own twist (e.g. 'add a smoky mezcal edge')"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button
          type="submit"
          disabled={custom.trim().length < 2}
          className="btn-primary !py-2.5 text-sm"
        >
          Remix it 🔀
        </button>
      </form>
    </div>
  );
}
