import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";

export const PhotoConsents: CollectionConfig = {
  slug: "photo-consents",
  labels: {
    singular: "Foto-Zustimmung",
    plural: "Foto-Zustimmungen (Eltern)",
  },
  admin: {
    useAsTitle: "childName",
    defaultColumns: ["childName", "team", "status", "confirmedAt"],
    description:
      "Zustimmungen der Eltern zu Mannschaftsfotos aus /foto-zustimmung. Nur 'bestätigt' zählt. Bei einem Widerruf blendet die Seite das Foto des Teams automatisch aus.",
    group: "3. Verein",
  },
  access: {
    // Public CANNOT read consents. Only admins.
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    // Public writes only through /api/foto-zustimmung (Local API).
    create: () => false,
  },
  fields: [
    {
      name: "team",
      type: "relationship",
      relationTo: "teams",
      required: true,
      label: "Mannschaft",
    },
    { name: "childName", type: "text", required: true, label: "Kind" },
    {
      name: "parentName",
      type: "text",
      required: true,
      label: "Erziehungsberechtigte:r",
    },
    { name: "email", type: "email", required: true, label: "E-Mail" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "offen",
      label: "Status",
      options: [
        { label: "Offen (Mail nicht bestätigt)", value: "offen" },
        { label: "Bestätigt", value: "bestaetigt" },
        { label: "Widerrufen", value: "widerrufen" },
      ],
      admin: {
        description:
          "Wird über die Links in der Mail gesetzt. Von Hand nur ändern, wenn Eltern sich direkt beim Verein melden.",
      },
    },
    {
      name: "consentText",
      type: "textarea",
      required: true,
      label: "Zugestimmter Text",
      admin: { readOnly: true },
    },
    {
      name: "confirmedAt",
      type: "date",
      label: "Bestätigt am",
      admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "revokedAt",
      type: "date",
      label: "Widerrufen am",
      admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "tokenHash",
      type: "text",
      required: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: "notes",
      type: "textarea",
      label: "Interne Notizen",
      admin: { description: "Nur für Vereins-Admins sichtbar." },
    },
  ],
  timestamps: true,
};
