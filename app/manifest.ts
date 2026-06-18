import type { MetadataRoute } from "next";

// Web App Manifest — makes Bob installable to the home screen as a PWA.
// On iPhone: open the site in Safari → Share → "Add to Home Screen".
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bob the AI Mixologist",
    short_name: "Bob",
    description:
      "Turn any idea into a stunning cocktail recipe and image, then share it with the community.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8F0",
    theme_color: "#FF6B6B",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
