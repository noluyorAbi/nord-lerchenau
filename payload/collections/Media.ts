import path from "node:path";
import { fileURLToPath } from "node:url";

import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "System",
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
    { name: "alt", type: "text", required: true },
    { name: "caption", type: "text" },
    { name: "credit", type: "text" },
  ],
};
