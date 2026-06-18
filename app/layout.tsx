import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bob the AI Mixologist",
  description:
    "Turn any idea, mood or occasion into a stunning cocktail recipe — then generate a marketing-ready image and share it with the community.",
  openGraph: {
    title: "Bob the AI Mixologist",
    description: "AI-crafted cocktails, beautiful images, community-voted.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-cocktail-cream/80 border-b border-cocktail-peach/30">
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍹</span>
          <span className="font-display text-xl font-bold text-cocktail-plum">
            Bob<span className="text-cocktail-coral">.</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3 text-sm font-semibold text-cocktail-plum">
          <Link href="/gallery" className="px-3 py-2 rounded-full hover:bg-white/70">
            Gallery
          </Link>
          <Link href="/profile" className="px-3 py-2 rounded-full hover:bg-white/70">
            Profile
          </Link>
          <Link href="/create" className="btn-primary !px-4 !py-2 text-sm">
            Create
          </Link>
        </div>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-cocktail-peach/30 bg-white/50">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-cocktail-plum/70 space-y-2">
        <p className="font-semibold">
          🍹 Bob the AI Mixologist — drink creativity, responsibly.
        </p>
        <p>
          Please drink responsibly. 18+ only where alcohol is served. Wellness
          &amp; CBD ingredients are for flavour and lifestyle only and are not
          medical advice.
        </p>
        <p className="text-xs">
          Sponsored content is clearly labelled. We never imply an official
          brand partnership unless a sponsor relationship is confirmed.
        </p>
      </div>
    </footer>
  );
}
