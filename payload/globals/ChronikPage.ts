import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const ChronikPage: GlobalConfig = {
  slug: "chronik-page",
  label: "Chronik (Vereinsgeschichte)",
  admin: {
    group: "4. Seiten",
    description: "Inhalte der Seite /chronik.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("chronik-page")] },
  fields: [
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: "Titelbild",
      admin: { description: "Großes Bild oben auf der Chronik-Seite." },
    },
    {
      name: "intro",
      type: "textarea",
      label: "Einleitung",
      admin: { description: "Kurzer Absatz unter der Überschrift." },
    },
    {
      name: "body",
      type: "richText",
      required: true,
      label: "Haupttext",
      admin: { description: "Die eigentliche Vereinsgeschichte." },
    },
  ],
};
