"use client";

import { useState } from "react";

// Social sharing for a published cocktail.
//
// Facebook, X/Twitter and WhatsApp support web share intents. Instagram has
// no public web "share to feed" URL, so we use the native Web Share API where
// available (great on mobile, which is our primary target) and otherwise copy
// a caption to the clipboard so the user can paste it into the IG app.
export default function ShareButtons({
  url,
  title,
  text,
}: {
  url: string;
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const enc = encodeURIComponent;
  // Resolve relative URLs (e.g. "/cocktail/123") to absolute for share intents.
  const shareUrl =
    url.startsWith("/") && typeof window !== "undefined"
      ? `${window.location.origin}${url}`
      : url;
  const caption = `${title} — ${text}`;

  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`;
  const twitter = `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(caption)}`;
  const whatsapp = `https://wa.me/?text=${enc(`${caption} ${shareUrl}`)}`;

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: caption, url: shareUrl });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(`${caption}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-cocktail-plum/80">Share:</span>
      <a className="btn-secondary !px-4 !py-2 text-sm" href={facebook} target="_blank" rel="noreferrer">
        Facebook
      </a>
      <a className="btn-secondary !px-4 !py-2 text-sm" href={twitter} target="_blank" rel="noreferrer">
        X
      </a>
      <a className="btn-secondary !px-4 !py-2 text-sm" href={whatsapp} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      {/* Instagram has no web share endpoint — use native share / copy caption. */}
      <button className="btn-secondary !px-4 !py-2 text-sm" onClick={nativeShare}>
        Instagram / More
      </button>
      <button className="btn-ghost !px-4 !py-2 text-sm" onClick={copy}>
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
