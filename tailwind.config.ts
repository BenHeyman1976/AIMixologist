import type { Config } from "tailwindcss";

// Warm cocktail palette — premium, social, image-led.
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cocktail: {
          peach: "#FFB17A",
          coral: "#FF6B6B",
          amber: "#F59E0B",
          sunset: "#FF8C42",
          plum: "#5B2333",
          cream: "#FFF8F0",
          ink: "#1A1410",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 10px 40px -12px rgba(91, 35, 51, 0.35)",
      },
      backgroundImage: {
        "warm-gradient":
          "linear-gradient(135deg, #FF8C42 0%, #FF6B6B 50%, #5B2333 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
