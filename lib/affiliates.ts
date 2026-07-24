// ─────────────────────────────────────────────────────────────
// Affiliate "shop the ingredients" links.
//
// Turns a recipe ingredient line (e.g. "50ml gold rum") into a clean search
// term ("gold rum") and builds retailer search URLs for Amazon, Tesco and
// Ocado. Affiliate tags are read from env vars so you can monetise later
// without code changes.
//
// TODO(affiliate): for Tesco/Ocado, partner programmes (e.g. Awin) usually
// require wrapping these URLs in a tracked deep link. Swap the plain search
// URLs below for your network's deep-link format once you have an account.
// ─────────────────────────────────────────────────────────────

export interface Retailer {
  name: string;
  url: string;
}

// Units / filler words to strip so the search term is just the product.
const QUANTITY_RE =
  /^[\s\d.,/¼½¾–-]+(ml|cl|l|oz|cube|cubes|dash|dashes|measure|measures|part|parts|shot|shots|tsp|tbsp|g|grams|sprig|sprigs|slice|slices|scoop|scoops|drop|drops|splash|splash of)?\s*/i;

const FILLER_PREFIXES = [
  "top with",
  "topped with",
  "plenty of",
  "a little",
  "fresh",
  "chilled",
  "premium",
];

/** Reduces an ingredient line to a searchable product term. */
export function ingredientToSearchTerm(ingredient: string): string {
  let term = ingredient.toLowerCase().trim();
  term = term.replace(QUANTITY_RE, "");
  for (const f of FILLER_PREFIXES) {
    if (term.startsWith(f)) term = term.slice(f.length).trim();
  }
  // Drop parenthetical notes e.g. "(flavour only)".
  term = term.replace(/\(.*?\)/g, "").trim();
  // Cut trailing prep instructions after a comma.
  term = term.split(",")[0].trim();
  return term || ingredient.trim();
}

/** Builds affiliate/search links for the major retailers for one ingredient. */
export function retailerLinks(ingredient: string): Retailer[] {
  const q = encodeURIComponent(ingredientToSearchTerm(ingredient));
  const amazonTag = process.env.AMAZON_AFFILIATE_TAG;

  const amazon = `https://www.amazon.co.uk/s?k=${q}${
    amazonTag ? `&tag=${encodeURIComponent(amazonTag)}` : ""
  }`;
  const tesco = `https://www.tesco.com/groceries/en-GB/search?query=${q}`;
  const ocado = `https://www.ocado.com/search?entry=${q}`;

  return [
    { name: "Amazon", url: amazon },
    { name: "Tesco", url: tesco },
    { name: "Ocado", url: ocado },
  ];
}

/** Ingredients that aren't really shoppable (water, ice, glassware, garnish). */
export function isShoppable(ingredient: string): boolean {
  const term = ingredientToSearchTerm(ingredient);
  // Anything mentioning a glass isn't a shopping item.
  if (term.includes("glass")) return false;
  const skip = [
    "ice", "cubed ice", "crushed ice", "soda water", "water", "still water",
    "tap water", "coupe", "tumbler", "highball", "flute", "rocks", "garnish",
  ];
  return term.length > 1 && !skip.includes(term) && !term.includes("ice cube");
}
