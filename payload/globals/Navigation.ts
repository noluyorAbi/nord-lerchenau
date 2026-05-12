import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Navigation (Menüleiste)",
  admin: {
    group: "5. Einstellungen",
    description: "Menü-Einträge oben (Header) und unten (Footer).",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("navigation")] },
  fields: [
    {
      name: "header",
      type: "array",
      label: "Hauptmenü (oben in der Webseite)",
      admin: {
        description: "Einträge in der Reihenfolge wie sie erscheinen sollen.",
      },
      fields: [
        { name: "label", type: "text", required: true, label: "Menü-Text" },
        {
          name: "href",
          type: "text",
          required: true,
          label: "Ziel-Link",
          admin: {
            description: "z.B. '/news', '/fussball' oder vollständige URL.",
          },
        },
      ],
    },
    {
      name: "footerColumns",
      type: "array",
      label: "Footer-Spalten (Fußzeile)",
      admin: {
        description: "Spalten der Fußzeile. Pro Spalte: Überschrift + Links.",
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: "Spalten-Überschrift",
        },
        {
          name: "links",
          type: "array",
          label: "Links in dieser Spalte",
          fields: [
            { name: "label", type: "text", required: true, label: "Link-Text" },
            { name: "href", type: "text", required: true, label: "Ziel-Link" },
          ],
        },
      ],
    },
  ],
};
