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
    // Stable /public assets — NOT the file-convention routes (app/icon.png,
    // app/apple-icon.png), which Next 16 serves at hashed, per-build URLs that a
    // static manifest cannot reference (bare /icon and /apple-icon both 404).
    // The apple-touch-icon is delivered via the auto-generated
    // <link rel="apple-touch-icon"> head tag, so the PWA manifest only needs the
    // Android/installable icons (192 + 512).
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
