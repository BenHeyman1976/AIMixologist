import type { Config } from "tailwindcss";

// Blush / rose / gold palette — chic, feminine, premium (matches the iOS app).
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cocktail: {
          peach: "#FFC9DD",
          coral: "#E85D8A",
          amber: "#C9A14A",
          sunset: "#FF9EC0",
          plum: "#5A1F3D",
          cream: "#FFF5F8",
          ink: "#2A1620",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 10px 40px -12px rgba(90, 31, 61, 0.35)",
      },
      backgroundImage: {
        "warm-gradient":
          "linear-gradient(135deg, #FF9EC0 0%, #E85D8A 50%, #5A1F3D 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
