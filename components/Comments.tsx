"use client";

import { useState } from "react";
import type { Comment } from "@/lib/types";

// Comments section for a cocktail detail page.
export default function Comments({
  cocktailId,
  initialComments,
}: {
  cocktailId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cocktailId, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments((c) => [...c, data.comment]);
      setBody("");
    } catch (err: any) {
      setError(err.message ?? "Failed to add comment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="font-display text-xl font-bold text-cocktail-plum">
        Comments ({comments.length})
      </h2>

      <ul className="space-y-3">
        {comments.length === 0 && (
          <li className="text-sm text-cocktail-ink/60">
            No comments yet — be the first to say cheers! 🥂
          </li>
        )}
        {comments.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-cocktail-plum">@{c.username}</span>
              <span className="text-xs text-cocktail-ink/50">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-cocktail-ink/80">{c.body}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="space-y-2">
        <textarea
          className="input min-h-[80px]"
          placeholder="Add a comment…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={1000}
        />
        {error && <p className="text-sm text-cocktail-coral">{error}</p>}
        <button className="btn-primary text-sm" disabled={loading || !body.trim()}>
          {loading ? "Posting…" : "Post comment"}
        </button>
      </form>
    </section>
  );
}
