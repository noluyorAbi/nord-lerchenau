import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";

export const Submissions: CollectionConfig = {
  slug: "submissions",
  labels: {
    singular: "Kontaktanfrage",
    plural: "Kontaktanfragen (Posteingang)",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "createdAt", "handled"],
    description:
      "Nachrichten aus dem Kontaktformular. Häkchen 'Erledigt' setzen, wenn beantwortet.",
    group: "3. Verein",
  },
  access: {
    // Public CANNOT read submissions. Only admins.
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    // Public CAN create — but only via the /api/contact route, not directly.
    // The route handler uses Payload's local API, which bypasses access checks.
    create: () => false,
  },
  fields: [
    { name: "name", type: "text", required: true, label: "Absender:in" },
    { name: "email", type: "email", required: true, label: "E-Mail" },
    { name: "phone", type: "text", required: true, label: "Telefon" },
    { name: "address", type: "textarea", required: true, label: "Adresse" },
    { name: "subject", type: "text", required: true, label: "Betreff" },
    { name: "message", type: "textarea", required: true, label: "Nachricht" },
    {
      name: "handled",
      type: "checkbox",
      defaultValue: false,
      label: "Erledigt",
      admin: {
        description: "Häkchen setzen, wenn die Anfrage beantwortet ist.",
      },
    },
    {
      name: "notes",
      type: "textarea",
      label: "Interne Notizen",
      admin: {
        description: "Nur für Vereins-Admins sichtbar — nicht öffentlich.",
      },
    },
  ],
  timestamps: true,
};
