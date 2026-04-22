import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const Fixtures: CollectionConfig = {
  slug: "fixtures",
  admin: {
    useAsTitle: "opponent",
    defaultColumns: ["team", "opponent", "kickoff", "competition", "isHome"],
    group: "Sport",
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
    { name: "team", type: "relationship", relationTo: "teams", required: true },
    {
      name: "opponent",
      type: "text",
      required: true,
      admin: { description: "Name des gegnerischen Vereins" },
    },
    {
      name: "kickoff",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "competition",
      type: "text",
      admin: { description: "z.B. Bezirksliga · Spieltag 20" },
    },
    {
      name: "venue",
      type: "text",
      admin: { description: "z.B. Eschengarten · ASV Dachau" },
    },
    {
      name: "isHome",
      type: "checkbox",
      defaultValue: true,
      label: "Heimspiel",
    },
    {
      name: "result",
      type: "group",
      admin: { description: "Erst nach dem Spiel ausfüllen." },
      fields: [
        { name: "homeGoals", type: "number" },
        { name: "awayGoals", type: "number" },
      ],
    },
  ],
};
