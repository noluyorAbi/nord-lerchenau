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
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "sport", "ageGroup", "league", "season"],
    group: "Sport",
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
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, admin: { description: "Auto-generated from name. Edit only if you know what you're doing." } },
    {
      name: "sport",
      type: "select",
      required: true,
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
      options: [
        { label: "Senioren", value: "senioren" },
        { label: "Junioren", value: "junioren" },
        { label: "Juniorinnen", value: "juniorinnen" },
        { label: "Bambini", value: "bambini" },
        { label: "Allgemein", value: "allgemein" },
      ],
      defaultValue: "allgemein",
    },
    { name: "ageGroup", type: "text", admin: { description: "z.B. A1, B2, F3, Bambini" } },
    { name: "season", type: "text", admin: { description: "z.B. 2025/26" } },
    { name: "league", type: "text", admin: { description: "z.B. Bezirksliga Oberbayern" } },
    {
      name: "bfv",
      type: "group",
      admin: {
        description:
          "Link the team to its BFV registry entry so live data + links show up.",
      },
      fields: [
        {
          name: "teamId",
          type: "text",
          admin: { description: "32-char BFV/DFB-Net ID, e.g. 016PMM83PG000000VV0AG811VUDIC8D7" },
        },
        {
          name: "slug",
          type: "text",
          admin: { description: "URL slug for BFV, e.g. sv-n-lerchenau" },
        },
        {
          name: "spielklasse",
          type: "text",
          admin: { description: "BFV-Wortlaut der Spielklasse, e.g. 'Herren / Bezirksliga'" },
        },
        {
          name: "partner",
          type: "text",
          admin: { description: "Für SG-Teams, z.B. 'Spielgemeinschaft mit Fasanarie-Nord'" },
        },
      ],
    },
    {
      name: "fupa",
      type: "group",
      admin: {
        description:
          "Link the team to fupa.net so squad + player images light up. Youth SGs split the season into autumn/spring halves — store both and the site picks the current one.",
      },
      fields: [
        {
          name: "slug",
          type: "text",
          admin: {
            description:
              "Primary fupa team slug, e.g. sv-nord-muenchen-lerchenau-m1-2025-26",
          },
        },
        {
          name: "autumnSlug",
          type: "text",
          admin: {
            description:
              "Hinrunde-Slug for youth SGs, e.g. sg-n-lerchenau-fasanerie-n-u19-1-autumn2025",
          },
        },
        {
          name: "springSlug",
          type: "text",
          admin: {
            description:
              "Rückrunde-Slug for youth SGs, e.g. sg-n-lerchenau-fasanerie-n-u19-1-spring2026",
          },
        },
      ],
    },
    {
      name: "trainers",
      type: "relationship",
      relationTo: "people",
      hasMany: true,
    },
    {
      name: "description",
      type: "richText",
    },
    { name: "photo", type: "upload", relationTo: "media" },
    {
      name: "externalLinks",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
      admin: { description: "z.B. BFV Spielplan, Tabelle, etc." },
    },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
