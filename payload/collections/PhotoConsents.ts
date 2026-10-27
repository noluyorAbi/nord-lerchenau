import type { CollectionConfig } from "payload";

import { authenticated } from "../access/authenticated";
import {
  fillManualConsent,
  hidePhotoOnRevoke,
  stampStatusChange,
} from "../hooks/photoConsent";

export const PhotoConsents: CollectionConfig = {
  slug: "photo-consents",
  labels: {
    singular: "Foto-Zustimmung",
    plural: "Foto-Zustimmungen (Eltern)",
  },
  admin: {
    useAsTitle: "childName",
    defaultColumns: ["childName", "team", "status", "source", "confirmedAt"],
    description:
      "Zustimmungen der Eltern zu Mannschaftsfotos. Online über /foto-zustimmung, Papier-Einwilligungen über 'Neu erstellen'. Nur 'bestätigt' zählt. Wird eine bestätigte Zustimmung widerrufen, online oder hier von Hand, blendet die Seite das Foto der Mannschaft automatisch aus.",
    group: "3. Verein",
  },
  access: {
    // Public CANNOT read consents. Only admins.
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    // Admins erfassen Papier-Einwilligungen von Hand. Oeffentlich wird nur
    // ueber /api/foto-zustimmung geschrieben (Local API, overrideAccess).
    create: authenticated,
  },
  hooks: {
    beforeValidate: [fillManualConsent],
    beforeChange: [stampStatusChange],
    afterChange: [hidePhotoOnRevoke],
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
    {
      name: "email",
      type: "email",
      label: "E-Mail",
      admin: {
        description:
          "Bei Online-Zustimmungen immer gesetzt. Bei Papier-Einwilligungen optional.",
      },
    },
    {
      name: "source",
      type: "select",
      label: "Quelle",
      // Wer im Admin angemeldet ist, erfasst eine Papier-Einwilligung; die
      // Online-Route setzt "online" selbst.
      defaultValue: ({ user }) => (user ? "papier" : "online"),
      options: [
        { label: "Online-Formular", value: "online" },
        { label: "Papier (von Hand erfasst)", value: "papier" },
      ],
      access: { update: () => false },
      admin: {
        position: "sidebar",
        description:
          "Wird beim Anlegen festgelegt und danach nicht mehr geändert.",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: ({ user }) => (user ? "bestaetigt" : "offen"),
      label: "Status",
      options: [
        { label: "Offen (Mail nicht bestätigt)", value: "offen" },
        { label: "Bestätigt", value: "bestaetigt" },
        { label: "Widerrufen", value: "widerrufen" },
      ],
      admin: {
        description:
          "Online setzen die Links in der Mail den Status. Von Hand nur ändern, wenn Eltern sich direkt beim Verein melden; 'Bestätigt am' und 'Widerrufen am' werden dabei automatisch gesetzt.",
      },
    },
    {
      name: "consentText",
      type: "textarea",
      required: true,
      label: "Zugestimmter Text",
      admin: {
        readOnly: true,
        description:
          "Wird automatisch gespeichert: der Formulartext oder, bei Papier, ein Hinweis aufs Original.",
      },
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
