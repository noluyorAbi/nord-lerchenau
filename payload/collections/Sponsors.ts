import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "tier", "url"],
    group: "Verein",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateOnChange("sponsors")],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "upload", relationTo: "media", required: true },
    { name: "url", type: "text" },
    {
      name: "tier",
      type: "select",
      required: true,
      options: [
        { label: "Premium", value: "premium" },
        { label: "Standard", value: "standard" },
      ],
      defaultValue: "standard",
    },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
