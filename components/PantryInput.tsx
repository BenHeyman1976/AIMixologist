"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MicButton from "@/components/MicButton";

// "Use what I own" entry: collect the ingredients someone already has, then hand
// off to the create studio in pantry mode (?have=…). Quick-add chips make it
// drunk-proof and fast on mobile.
const SUGGESTIONS = [
  "Gin",
  "Vodka",
  "White rum",
  "Tequila",
  "Whisky",
  "Prosecco",
  "Lemon",
  "Lime",
  "Orange",
  "Mint",
  "Soda water",
  "Tonic",
  "Elderflower cordial",
  "Ginger beer",
  "Sugar",
  "Angostura bitters",
];

export default function PantryInput() {
  const router = useRouter();
  const [items, setItems] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const v = raw.trim().replace(/,$/, "");
    if (!v) return;
    if (!items.some((i) => i.toLowerCase() === v.toLowerCase())) {
      setItems((prev) => [...prev, v]);
    }
    setDraft("");
  }

  function remove(item: string) {
    setItems((prev) => prev.filter((i) => i !== item));
  }

  function go() {
    if (items.length === 0) return;
    router.push(`/create?have=${encodeURIComponent(items.join(","))}`);
  }

  const remaining = SUGGESTIONS.filter(
    (s) => !items.some((i) => i.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="card p-5 space-y-4">
        {/* Selected items */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <button
                key={item}
                onClick={() => remove(item)}
                className="chip flex items-center gap-1 bg-cocktail-coral/15 text-cocktail-plum hover:bg-cocktail-coral/25"
              >
                {item} <span className="text-cocktail-coral">✕</span>
              </button>
            ))}
          </div>
        )}

        {/* Type-to-add */}
        <div className="flex items-center gap-3">
          <input
            className="input flex-1"
            placeholder="Type an ingredient and press Enter (e.g. gin)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add(draft);
              }
            }}
          />
          <MicButton
            onResult={(t) => t.split(/,|\band\b/).forEach((x) => add(x))}
            title="Say what you've got"
          />
        </div>

        <button
          onClick={go}
          disabled={items.length === 0}
          className="btn-primary w-full"
        >
          {items.length === 0
            ? "Add a few things first"
            : `Make me a cocktail from these ${items.length} 🍹`}
        </button>
      </div>

      {/* Quick-add suggestions */}
      {remaining.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-cocktail-ink/60">
            Quick add:
          </p>
          <div className="flex flex-wrap gap-2">
            {remaining.map((s) => (
              <button
                key={s}
                onClick={() => add(s)}
                className="chip hover:bg-cocktail-peach/30"
              >
                ＋ {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
