import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SV Nord München-Lerchenau e.V.",
    short_name: "SV Nord",
    description:
      "Traditionsverein im Münchner Norden seit 1947 — Fußball, Volleyball, Gymnastik, Ski.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#0b1b3f",
    lang: "de",
    categories: ["sports", "lifestyle"],
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
