// Warm, premium cocktail palette — shared across the app.
export const colors = {
  peach: "#FFB17A",
  coral: "#FF6B6B",
  amber: "#F59E0B",
  sunset: "#FF8C42",
  plum: "#5B2333",
  cream: "#FFF8F0",
  ink: "#1A1410",
  white: "#FFFFFF",
  // Overlay tints used on top of full-screen feed images.
  scrim: "rgba(0,0,0,0.45)",
  glass: "rgba(255,255,255,0.16)",
};

export const gradient = {
  warm: [colors.sunset, colors.coral, colors.plum] as const,
};

export const radius = {
  sm: 10,
  md: 18,
  lg: 28,
  pill: 999,
};

export const spacing = (n: number) => n * 8;
