// Resolves the public base URL of the site, for building absolute links that
// get shared off-platform (social captions, share sheets, etc.).
//
// Priority: explicit NEXT_PUBLIC_SITE_URL → Vercel's deployment URL → localhost.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

/** Absolute URL for a cocktail's public page. */
export function cocktailUrl(id: string): string {
  return `${siteUrl()}/cocktail/${id}`;
}
