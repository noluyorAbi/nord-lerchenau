import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const Events: CollectionConfig = {
  slug: "events",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "startsAt", "location"],
    group: "Content",
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
    { name: "title", type: "text", required: true },
    {
      name: "startsAt",
      type: "date",
      required: true,
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "endsAt",
      type: "date",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
    { name: "location", type: "text" },
    { name: "description", type: "richText" },
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "ctaUrl",
      type: "text",
      admin: { description: "Optional. Externer Link, z.B. zur Anmeldung." },
    },
  ],
};
