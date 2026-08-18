import path from "node:path";
import { fileURLToPath } from "node:url";

import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import {
  revalidateMediaOnChange,
  revalidateMediaOnDelete,
} from "../hooks/revalidate";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Bild", plural: "Bilder & Medien" },
  admin: {
    useAsTitle: "filename",
    description:
      "Alle hochgeladenen Bilder. 'Alt-Text' ist Pflicht (Beschreibung für Screenreader & SEO). " +
      "Bitte höchstens 4 MB pro Datei hochladen: größere Dateien werden vom Server abgewiesen. " +
      "Handy-Fotos vorher verkleinern (z.B. in der Fotos-App teilen und 'Mittel' wählen).",
    group: "9. System",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  // Replacing an image changes only this document, so without these hooks the
  // pages that embed it keep serving the old file from the data cache until its
  // 24h window expires. See the media branch in /api/revalidate for the tags.
  hooks: {
    afterChange: [revalidateMediaOnChange],
    afterDelete: [revalidateMediaOnDelete],
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
        hidden: true,
        description: "Optional. Wird unter dem Bild angezeigt.",
      },
    },
    {
      name: "credit",
      type: "text",
      label: "Bildquelle / Fotograf:in",
      admin: {
        hidden: true,
        description: "Optional. z.B. 'Foto: Max Mustermann'.",
      },
    },
  ],
};
