import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Navigation (Menüleiste)",
  admin: {
    group: "5. Einstellungen",
    description:
      "Links der Fußzeile. Das Hauptmenü oben ist bewusst fest im Code hinterlegt, damit es am Handy und im Browser identisch aufgebaut ist.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("navigation")] },
  fields: [
    {
      name: "header",
      type: "array",
      label: "Hauptmenü (oben in der Webseite)",
      // Ausgeblendet statt gelöscht: die Spalte bleibt in der Datenbank, es
      // braucht also keine Migration. Das Hauptmenü kommt seit dem Umbau aus
      // `lib/nav-tree.ts`, weil Handy und Browser sonst zwei verschiedene
      // Menüs zeigen (Fußball stand am Handy ganz oben, im Browser unter
      // "Abteilungen"). Ein Feld, das nichts mehr bewirkt, gehört nicht in
      // den Editor.
      admin: {
        hidden: true,
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
