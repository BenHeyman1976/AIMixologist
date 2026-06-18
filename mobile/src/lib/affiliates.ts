// Affiliate "shop the ingredients" links — mirrors the web lib/affiliates.ts.
// TODO(affiliate): drop in your Amazon Associates tag + network deep links.

const AMAZON_TAG = ""; // e.g. "bobmixology-21"

const QUANTITY_RE =
  /^[\s\d.,/¼½¾–-]+(ml|cl|l|oz|cube|cubes|dash|dashes|measure|measures|part|parts|shot|shots|tsp|tbsp|g|grams|sprig|sprigs|slice|slices|scoop|scoops|drop|drops|splash|splash of)?\s*/i;

const FILLER = ["top with", "topped with", "plenty of", "a little", "fresh", "chilled", "premium"];

export function ingredientToSearchTerm(ingredient: string): string {
  let term = ingredient.toLowerCase().trim().replace(QUANTITY_RE, "");
  for (const f of FILLER) if (term.startsWith(f)) term = term.slice(f.length).trim();
  term = term.replace(/\(.*?\)/g, "").trim().split(",")[0].trim();
  return term || ingredient.trim();
}

export function isShoppable(ingredient: string): boolean {
  const term = ingredientToSearchTerm(ingredient);
  return term.length > 1 && !["ice", "cubed ice", "soda water", "water"].includes(term);
}

export function retailerLinks(ingredient: string): { name: string; url: string }[] {
  const q = encodeURIComponent(ingredientToSearchTerm(ingredient));
  return [
    {
      name: "Amazon",
      url: `https://www.amazon.co.uk/s?k=${q}${AMAZON_TAG ? `&tag=${AMAZON_TAG}` : ""}`,
    },
    { name: "Tesco", url: `https://www.tesco.com/groceries/en-GB/search?query=${q}` },
    { name: "Ocado", url: `https://www.ocado.com/search?entry=${q}` },
  ];
}
