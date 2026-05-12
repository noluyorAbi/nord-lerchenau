import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const VereinsheimPage: GlobalConfig = {
  slug: "vereinsheim-page",
  label: "Vereinsheim",
  admin: {
    group: "4. Seiten",
    description: "Inhalte der Seite /vereinsheim.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("vereinsheim-page")] },
  fields: [
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Titelbild",
    },
    {
      name: "intro",
      type: "textarea",
      label: "Einleitung",
      admin: { description: "Kurzer Absatz unter der Überschrift." },
    },
    { name: "body", type: "richText", required: true, label: "Haupttext" },
    {
      name: "gallery",
      type: "array",
      label: "Bildergalerie",
      admin: { description: "Mehrere Fotos vom Vereinsheim." },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
          label: "Bild",
        },
        {
          name: "caption",
          type: "text",
          label: "Bildunterschrift",
          admin: { description: "Optional." },
        },
      ],
    },
  ],
};
