import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const People: CollectionConfig = {
  slug: "people",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "function", "role", "email"],
    group: "Sport",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange("people")],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "text",
      required: true,
      admin: {
        description: "e.g. 1. Vorstand · Sportlicher Leiter · Trainer A1",
      },
    },
    {
      name: "function",
      type: "select",
      required: true,
      options: [
        { label: "Vorstand", value: "vorstand" },
        { label: "Sportleitung", value: "sportleitung" },
        { label: "Jugendleitung", value: "jugendleitung" },
        { label: "Trainer", value: "trainer" },
        { label: "Zeugwart", value: "zeugwart" },
        { label: "Spieler", value: "spieler" },
        { label: "Andere", value: "andere" },
      ],
    },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "phone", type: "text" },
    { name: "email", type: "email" },
    {
      name: "team",
      type: "relationship",
      relationTo: "teams",
      admin: { description: "Optional. Used for trainer/player assignment." },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { description: "Lower = earlier in lists." },
    },
  ],
};
