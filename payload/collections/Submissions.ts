import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";

export const Submissions: CollectionConfig = {
  slug: "submissions",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "createdAt", "handled"],
    group: "Verein",
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
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "subject", type: "text" },
    { name: "message", type: "textarea", required: true },
    {
      name: "handled",
      type: "checkbox",
      defaultValue: false,
      label: "Erledigt",
    },
    {
      name: "notes",
      type: "textarea",
      admin: { description: "Interne Notizen — nicht öffentlich." },
    },
  ],
  timestamps: true,
};
