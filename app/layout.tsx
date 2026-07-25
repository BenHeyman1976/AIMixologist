import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser, isLoggedIn } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Siply — Your Cocktail Concierge",
  description:
    "Turn any idea, mood or occasion into a stunning cocktail recipe — then generate a beautiful image and share it with the community.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Siply",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Siply — Your Cocktail Concierge",
    description: "AI-crafted cocktails, beautiful images, community-voted.",
  },
};

export const viewport: Viewport = {
  themeColor: "#E85D8A",
  // Let the app draw under the iPhone notch when launched from the home screen.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
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
  const loggedIn = isLoggedIn();
  const user = getCurrentUser();
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-cocktail-cream/80 border-b border-cocktail-peach/30">
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍹</span>
          <span className="font-display text-xl font-bold text-cocktail-plum">
            Siply<span className="text-cocktail-coral">.</span>
          </span>
        </Link>
        {loggedIn ? (
          <div className="flex items-center gap-1 sm:gap-3 text-sm font-semibold text-cocktail-plum">
            <Link
              href="/pantry"
              className="hidden px-3 py-2 rounded-full hover:bg-white/70 sm:inline"
            >
              What can I make?
            </Link>
            <Link href="/gallery" className="px-3 py-2 rounded-full hover:bg-white/70">
              Gallery
            </Link>
            <Link
              href="/profile"
              className="hidden px-3 py-2 rounded-full hover:bg-white/70 sm:inline"
            >
              @{user.username}
            </Link>
            <LogoutButton />
            <Link href="/create" className="btn-primary !px-4 !py-2 text-sm">
              Create
            </Link>
          </div>
        ) : (
          <Link href="/login" className="btn-primary !px-4 !py-2 text-sm">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-cocktail-peach/30 bg-white/50">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-cocktail-plum/70 space-y-2">
        <p className="font-semibold">
          🍸 Siply — drink creativity, responsibly.
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
