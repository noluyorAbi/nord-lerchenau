import type { CollectionBeforeChangeHook, CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";
import { slug as toSlug } from "@/lib/slug";

const fillSlug: CollectionBeforeChangeHook = ({ data }) => {
  if (!data.slug && data.name) {
    data.slug = toSlug(String(data.name));
  }
  return data;
};

export const Teams: CollectionConfig = {
  slug: "teams",
  labels: { singular: "Mannschaft", plural: "Mannschaften" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "sport", "ageGroup", "league", "season"],
    description:
      "Alle Teams (Senioren, Jugend, Volleyball etc.). BFV-/Fupa-IDs hier eintragen für Live-Daten.",
    group: "2. Sport",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    beforeChange: [fillSlug],
    afterChange: [revalidateOnChange("teams")],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Mannschaftsname",
      admin: { description: "z.B. '1. Herren', 'U19 Junioren', 'Bambini F3'." },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "URL-Kürzel",
      admin: {
        description:
          "Wird automatisch aus dem Namen erstellt. Nur ändern, wenn nötig.",
      },
    },
    {
      name: "sport",
      type: "select",
      required: true,
      label: "Sportart",
      options: [
        { label: "Fußball", value: "fussball" },
        { label: "Volleyball", value: "volleyball" },
        { label: "Gymnastik", value: "gymnastik" },
        { label: "Ski", value: "ski" },
        { label: "Esport", value: "esport" },
        { label: "Schiedsrichter", value: "schiedsrichter" },
      ],
    },
    {
      name: "category",
      type: "select",
      label: "Kategorie",
      admin: { description: "Grobe Einteilung für die Auflistung." },
      options: [
        { label: "Senioren", value: "senioren" },
        { label: "Junioren", value: "junioren" },
        { label: "Juniorinnen", value: "juniorinnen" },
        { label: "Bambini", value: "bambini" },
        { label: "Allgemein", value: "allgemein" },
      ],
      defaultValue: "allgemein",
    },
    {
      name: "ageGroup",
      type: "text",
      label: "Altersklasse",
      admin: { description: "z.B. A1, B2, F3, Bambini." },
    },
    {
      name: "birthYears",
      type: "text",
      label: "Jahrgänge",
      admin: {
        description:
          "Kommagetrennt, z.B. '2006, 2007, 2008'. Erscheint hinter dem Mannschaftstitel.",
      },
    },
    {
      name: "season",
      type: "text",
      label: "Saison",
      admin: { description: "z.B. '2025/26'." },
    },
    {
      name: "league",
      type: "text",
      label: "Liga / Spielklasse",
      admin: { description: "z.B. 'Bezirksliga Oberbayern'." },
    },
    {
      name: "bfv",
      type: "group",
      label: "BFV-Verknüpfung (Spielplan & Tabelle)",
      admin: {
        description:
          "BFV-Daten verknüpfen, damit Live-Spielplan und Tabelle auf der Webseite erscheinen.",
      },
      fields: [
        {
          name: "teamId",
          type: "text",
          label: "BFV Team-ID",
          admin: {
            description:
              "32-stellige BFV/DFB-Net ID, z.B. 016PMM83PG000000VV0AG811VUDIC8D7.",
          },
        },
        {
          name: "slug",
          type: "text",
          label: "BFV URL-Kürzel",
          admin: { description: "z.B. 'sv-n-lerchenau'." },
        },
        {
          name: "spielklasse",
          type: "text",
          label: "BFV Spielklasse",
          admin: {
            description: "BFV-Wortlaut, z.B. 'Herren / Bezirksliga'.",
          },
        },
        {
          name: "partner",
          type: "text",
          label: "SG-Partner",
          admin: {
            description:
              "Nur für Spielgemeinschaften, z.B. 'Spielgemeinschaft mit Fasanarie-Nord'.",
          },
        },
      ],
    },
    {
      name: "fupa",
      type: "group",
      label: "Fupa-Verknüpfung (Kader & Spielerbilder)",
      admin: {
        description:
          "Verknüpft das Team mit fupa.net, damit Kader und Spielerfotos angezeigt werden. Bei Jugend-SGs zusätzlich Hin- und Rückrunde eintragen.",
      },
      fields: [
        {
          name: "slug",
          type: "text",
          label: "Fupa Team-Slug",
          admin: {
            description:
              "Haupt-Slug, z.B. 'sv-nord-muenchen-lerchenau-m1-2025-26'.",
          },
        },
        {
          name: "autumnSlug",
          type: "text",
          label: "Fupa Hinrunde-Slug",
          admin: {
            description:
              "Nur Jugend-SGs. z.B. 'sg-n-lerchenau-fasanerie-n-u19-1-autumn2025'.",
          },
        },
        {
          name: "springSlug",
          type: "text",
          label: "Fupa Rückrunde-Slug",
          admin: {
            description:
              "Nur Jugend-SGs. z.B. 'sg-n-lerchenau-fasanerie-n-u19-1-spring2026'.",
          },
        },
      ],
    },
    {
      name: "trainers",
      type: "relationship",
      relationTo: "people",
      hasMany: true,
      label: "Trainer:innen",
      admin: {
        description:
          "Personen aus '2. Sport → Personen' auswählen (mehrere möglich).",
      },
    },
    {
      name: "description",
      type: "richText",
      label: "Beschreibung",
      admin: { description: "Optionale Vorstellung des Teams." },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "Mannschaftsfoto",
    },
    {
      name: "externalLinks",
      type: "array",
      label: "Weitere Links",
      admin: { description: "z.B. BFV Spielplan, Tabelle, externe Seiten." },
      fields: [
        { name: "label", type: "text", required: true, label: "Anzeige-Text" },
        { name: "url", type: "text", required: true, label: "Link (URL)" },
      ],
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
