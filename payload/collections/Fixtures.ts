import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const Fixtures: CollectionConfig = {
  slug: "fixtures",
  labels: { singular: "Spiel", plural: "Spiele (Begegnungen & Ergebnisse)" },
  admin: {
    useAsTitle: "opponent",
    defaultColumns: ["team", "opponent", "kickoff", "competition", "isHome"],
    description:
      "Manuelle Spielansetzungen und Ergebnisse. Tipp: Live-Spielplan kommt automatisch vom BFV, hier nur Sonderfälle eintragen.",
    group: "2. Sport",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange("fixtures")],
  },
  fields: [
    {
      name: "team",
      type: "relationship",
      relationTo: "teams",
      required: true,
      label: "Unsere Mannschaft",
      admin: { description: "Welches Team spielt?" },
    },
    {
      name: "opponent",
      type: "text",
      required: true,
      label: "Gegner",
      admin: { description: "Name des gegnerischen Vereins." },
    },
    {
      name: "kickoff",
      type: "date",
      required: true,
      label: "Anstoß (Datum & Uhrzeit)",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "competition",
      type: "text",
      label: "Wettbewerb",
      admin: { description: "z.B. 'Bezirksliga · Spieltag 20', 'Pokal'." },
    },
    {
      name: "venue",
      type: "text",
      label: "Spielort",
      admin: {
        description: "z.B. 'Eschengarten' oder 'ASV Dachau Sportanlage'.",
      },
    },
    {
      name: "isHome",
      type: "checkbox",
      defaultValue: true,
      label: "Heimspiel",
      admin: { description: "Angekreuzt = wir spielen zuhause." },
    },
    {
      name: "result",
      type: "group",
      label: "Ergebnis",
      admin: { description: "Erst nach dem Spiel ausfüllen." },
      fields: [
        { name: "homeGoals", type: "number", label: "Tore Heim" },
        { name: "awayGoals", type: "number", label: "Tore Auswärts" },
      ],
    },
  ],
};
