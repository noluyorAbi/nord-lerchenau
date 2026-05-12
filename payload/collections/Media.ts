import path from "node:path";
import { fileURLToPath } from "node:url";

import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Bild", plural: "Bilder & Medien" },
  admin: {
    useAsTitle: "filename",
    description:
      "Alle hochgeladenen Bilder. 'Alt-Text' ist Pflicht (Beschreibung für Screenreader & SEO).",
    group: "9. System",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  upload: {
    staticDir: path.resolve(dirname, "../../public/uploads"),
    imageSizes: [
      { name: "thumbnail", width: 320 },
      { name: "card", width: 768 },
      { name: "feature", width: 1280 },
      { name: "hero", width: 1920 },
    ],
    formatOptions: {
      format: "webp",
      options: { quality: 80 },
    },
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt-Text (Bildbeschreibung)",
      admin: {
        description:
          "Kurze Beschreibung des Bildinhalts. Pflicht! Wird für Screenreader und Google verwendet.",
      },
    },
    {
      name: "caption",
      type: "text",
      label: "Bildunterschrift",
      admin: {
        description: "Optional. Wird unter dem Bild angezeigt.",
      },
    },
    {
      name: "credit",
      type: "text",
      label: "Bildquelle / Fotograf:in",
      admin: { description: "Optional. z.B. 'Foto: Max Mustermann'." },
    },
  ],
};
