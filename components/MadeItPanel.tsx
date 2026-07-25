"use client";

import { useRef, useState } from "react";
import type { MakeStats } from "@/lib/types";

// The living cocktail page's heart: real-world validation. People log that they
// actually MADE the drink — with a star rating, a real photo, and/or a short
// review. This is the trust + community moat (real photos > AI images).
export default function MadeItPanel({
  cocktailId,
  initialStats,
}: {
  cocktailId: string;
  initialStats: MakeStats;
}) {
  const [stats, setStats] = useState<MakeStats>(initialStats);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await downscaleImage(file, 1200, 0.82);
      setPhoto(dataUrl);
    } catch {
      setError("Couldn't read that image — try another.");
    }
  }

  async function submit() {
    if (!rating && !note.trim() && !photo) {
      setError("Add a rating, a photo or a note first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/makes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cocktailId,
          rating: rating || null,
          note: note.trim() || null,
          photoDataUrl: photo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStats(data.stats);
      setDone(true);
      setOpen(false);
      setRating(0);
      setNote("");
      setPhoto(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-cocktail-peach/40 bg-white p-5">
      {/* Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-cocktail-plum">
            Made it 🍸
          </h3>
          <p className="text-sm text-cocktail-ink/70">
            {stats.made_count > 0 ? (
              <>
                <span className="font-semibold text-cocktail-plum">
                  {stats.made_count}
                </span>{" "}
                {stats.made_count === 1 ? "person has" : "people have"} made this
                {stats.rating_avg != null && (
                  <>
                    {" "}· <Stars value={Math.round(stats.rating_avg)} />{" "}
                    <span className="font-semibold text-cocktail-plum">
                      {stats.rating_avg}
                    </span>{" "}
                    <span className="text-cocktail-ink/50">
                      ({stats.rating_count})
                    </span>
                  </>
                )}
              </>
            ) : (
              "Be the first to make this and show it off."
            )}
          </p>
        </div>
        <button
          onClick={() => {
            setOpen((o) => !o);
            setDone(false);
          }}
          className="btn-primary !px-4 !py-2 text-sm"
        >
          {done ? "Logged ✓ Add another" : "I made this"}
        </button>
      </div>

      {/* Log form */}
      {open && (
        <div className="space-y-4 rounded-2xl bg-cocktail-cream/60 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-cocktail-plum">
              How was it?
            </span>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-secondary !px-4 !py-2 text-sm"
            >
              {photo ? "Change photo" : "📷 Add your photo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onPickPhoto}
            />
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt="Your cocktail"
                className="mt-3 h-40 w-40 rounded-xl object-cover"
              />
            )}
          </div>

          <textarea
            className="input min-h-[80px]"
            placeholder="How did it go? Any tweaks you made? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
          />

          {error && <p className="text-sm text-cocktail-coral">{error}</p>}

          <div className="flex gap-2">
            <button onClick={submit} disabled={submitting} className="btn-primary">
              {submitting ? "Saving…" : "Post it 🎉"}
            </button>
            <button onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && !open && <p className="text-sm text-cocktail-coral">{error}</p>}

      {/* Community photos */}
      {stats.photos.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-cocktail-plum">
            From the community 📸
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {stats.photos.map((m) => (
              <div key={m.id} className="group relative aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.photo_url!}
                  alt={`Made by @${m.username}`}
                  className="h-full w-full rounded-xl object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-1 left-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white">
                  @{m.username}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {stats.reviews.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-cocktail-plum">Reviews</p>
          {stats.reviews.map((m) => (
            <div key={m.id} className="rounded-xl bg-cocktail-cream/60 p-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-cocktail-plum">
                  @{m.username}
                </span>
                {m.rating && <Stars value={m.rating} />}
              </div>
              {m.note && <p className="mt-1 text-cocktail-ink/80">{m.note}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="text-cocktail-coral" aria-label={`${value} out of 5`}>
      {"★".repeat(value)}
      <span className="text-cocktail-ink/25">{"★".repeat(5 - value)}</span>
    </span>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-2xl leading-none transition ${
            n <= value ? "text-cocktail-coral" : "text-cocktail-ink/25 hover:text-cocktail-coral/50"
          }`}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/** Downscales an image file to a max dimension and returns a JPEG data URL. */
function downscaleImage(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
