export type UnitSystem = "ml" | "oz";

// Recipes are stored in ml; we convert to the chosen unit at DISPLAY time so
// the toggle is instant and deterministic (not reliant on the AI).

/** Convert any "50ml" measures in a string to oz (nearest ¼ oz). No-op for ml. */
export function displayMeasure(text: string, units: UnitSystem): string {
  if (units !== "oz") return text;
  return text.replace(/(\d+(?:\.\d+)?)\s?ml\b/gi, (_m, n) => {
    const oz = Number(n) / 29.5735;
    const rounded = Math.round(oz * 4) / 4; // nearest quarter-ounce
    return `${rounded} oz`;
  });
}
