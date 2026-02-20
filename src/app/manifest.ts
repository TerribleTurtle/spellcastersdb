import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spellcasters Chronicles Database",
    short_name: "SpellcastersDB",
    description:
      "A community database for Spellcasters Chronicles. Browse units, build decks, and view game data.",
    start_url: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#08fe00",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
