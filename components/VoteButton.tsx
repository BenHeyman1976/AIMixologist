"use client";

import { useState } from "react";

// Like/vote toggle. One vote per user per cocktail (enforced server-side).
export default function VoteButton({
  cocktailId,
  initialCount,
  initialVoted,
}: {
  cocktailId: string;
  initialCount: number;
  initialVoted: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    // Optimistic update
    const prev = { count, voted };
    setVoted(!voted);
    setCount((c) => c + (voted ? -1 : 1));
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cocktailId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCount(data.vote_count);
      setVoted(data.voted);
    } catch {
      setCount(prev.count);
      setVoted(prev.voted);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn ${voted ? "btn-primary" : "btn-secondary"} text-sm`}
      aria-pressed={voted}
    >
      <span>{voted ? "❤️" : "🤍"}</span>
      <span>{count}</span>
      <span className="hidden sm:inline">{voted ? "Voted" : "Vote"}</span>
    </button>
  );
}
