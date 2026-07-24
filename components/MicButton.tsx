"use client";

import { useEffect, useRef, useState } from "react";

// 🎤 Speech-to-text using the device's own engine (Web Speech API) — no server,
// no API key, no cost. Works in Chrome, Edge and Safari (incl. iPhone/Mac).
// Renders nothing on browsers that don't support it (e.g. Firefox).
export default function MicButton({
  onResult,
  title = "Speak your idea",
}: {
  onResult: (transcript: string) => void;
  title?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);
  // Keep the latest callback so the recogniser never calls a stale closure.
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "en-GB";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) onResultRef.current(transcript.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setSupported(true);

    return () => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    };
  }, []);

  if (!supported) return null;

  function toggle() {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        /* already started */
      }
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={title}
      aria-label={title}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg shadow-sm transition ${
        listening
          ? "animate-pulse bg-cocktail-coral text-white"
          : "border border-cocktail-peach bg-white text-cocktail-plum hover:bg-cocktail-cream"
      }`}
    >
      {listening ? "●" : "🎤"}
    </button>
  );
}
