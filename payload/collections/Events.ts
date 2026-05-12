import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const Events: CollectionConfig = {
  slug: "events",
  labels: { singular: "Termin", plural: "Termine & Veranstaltungen" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "startsAt", "location"],
    description:
      "Vereinsfeste, Versammlungen und sonstige Termine. Erscheint unter /termine.",
    group: "1. Inhalte",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange("events")],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Titel",
      admin: { description: "Name des Termins. z.B. 'Sommerfest 2026'." },
    },
    {
      name: "startsAt",
      type: "date",
      required: true,
      label: "Beginn",
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        description: "Wann startet die Veranstaltung?",
      },
    },
    {
      name: "endsAt",
      type: "date",
      label: "Ende",
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        description: "Optional. Wann endet sie?",
      },
    },
    {
      name: "location",
      type: "text",
      label: "Ort",
      admin: { description: "z.B. 'Vereinsheim Lerchenau' oder Adresse." },
    },
    {
      name: "description",
      type: "richText",
      label: "Beschreibung",
      admin: { description: "Programmpunkte, Ablauf, Hinweise." },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Bild",
      admin: { description: "Optional. Foto oder Plakat zum Termin." },
    },
    {
      name: "ctaUrl",
      type: "text",
      label: "Anmelde-Link",
      admin: {
        description:
          "Optional. Externer Link, z.B. zur Online-Anmeldung oder Eventseite.",
      },
    },
  ],
};
