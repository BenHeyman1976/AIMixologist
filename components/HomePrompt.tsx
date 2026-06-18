"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const EXAMPLES = [
  "Aperol + Trip CBD summer spritz",
  "Low-alcohol Christmas cocktail",
  "Something tropical for a BBQ",
];

// Hero prompt box on the home page. Hands the idea off to the create page.
export default function HomePrompt() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  function go(idea: string) {
    const q = idea.trim();
    if (!q) return;
    router.push(`/create?prompt=${encodeURIComponent(q)}`);
  }

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(prompt);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          className="input flex-1 text-lg shadow-card"
          placeholder="Describe your cocktail idea…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          aria-label="Describe your cocktail idea"
        />
        <button type="submit" className="btn-primary text-lg whitespace-nowrap">
          Generate Cocktail 🍹
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <span className="text-sm text-white/80">Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => go(ex)}
            className="rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur transition hover:bg-white/30"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
