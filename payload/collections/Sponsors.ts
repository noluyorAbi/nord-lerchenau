import type { CollectionConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateOnChange } from "../hooks/revalidate";

export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  labels: { singular: "Sponsor", plural: "Sponsoren & Partner" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "tier", "url"],
    description:
      "Sponsorenlogos. 'Premium' = große Karte, 'Standard' = kleine Kachel. Erscheint unter /sponsoren.",
    group: "3. Verein",
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
    {
      name: "name",
      type: "text",
      required: true,
      label: "Firmenname",
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Logo",
      admin: {
        description:
          "PNG mit transparentem Hintergrund bevorzugt. Wird zentriert auf dunklem Hintergrund angezeigt.",
      },
    },
    {
      name: "url",
      type: "text",
      label: "Website (Link)",
      admin: { description: "Optional. Vollständige URL inkl. https://." },
    },
    {
      name: "tier",
      type: "select",
      required: true,
      label: "Stufe",
      admin: {
        description: "Premium = große Karte, Standard = kleine Kachel.",
      },
      options: [
        { label: "Premium", value: "premium" },
        { label: "Standard", value: "standard" },
      ],
      defaultValue: "standard",
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: "Sortierung",
      admin: { description: "Kleinere Zahl = weiter oben." },
    },
  ],
};
