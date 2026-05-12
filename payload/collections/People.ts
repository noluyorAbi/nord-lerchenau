import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const People: CollectionConfig = {
  slug: "people",
  labels: {
    singular: "Person",
    plural: "Personen (Vorstand · Trainer · Spieler)",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "function", "role", "email"],
    description:
      "Vorstand, Trainer:innen, Spieler:innen. Über das Feld 'Funktion' wird die Person der richtigen Sektion auf der Website zugeordnet.",
    group: "2. Sport",
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
    {
      name: "name",
      type: "text",
      required: true,
      label: "Vor- und Nachname",
    },
    {
      name: "role",
      type: "text",
      required: true,
      label: "Rollenbezeichnung",
      admin: {
        description:
          "Wie soll die Rolle auf der Webseite stehen? z.B. '1. Vorstand', 'Sportlicher Leiter', 'Trainer A1'.",
      },
    },
    {
      name: "function",
      type: "select",
      required: true,
      label: "Funktion (Zuordnung)",
      admin: {
        description:
          "Bestimmt, in welcher Sektion die Person auf der Webseite erscheint.",
      },
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
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Foto",
      admin: { description: "Portraitfoto. Optional, aber empfohlen." },
    },
    {
      name: "phone",
      type: "text",
      label: "Telefon",
      admin: {
        description: "Optional. Wird nur bei Vorstand/Trainer gezeigt.",
      },
    },
    { name: "email", type: "email", label: "E-Mail" },
    {
      name: "team",
      type: "relationship",
      relationTo: "teams",
      label: "Mannschaft",
      admin: {
        description:
          "Optional. Nötig für Trainer- und Spielerzuordnung zu einer Mannschaft.",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: "Sortierung",
      admin: { description: "Kleinere Zahl = weiter oben in Listen." },
    },
  ],
};
