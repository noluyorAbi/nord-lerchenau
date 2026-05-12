import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const ContactInfo: GlobalConfig = {
  slug: "contact-info",
  label: "Kontaktdaten",
  admin: {
    group: "5. Einstellungen",
    description:
      "Adressen, Bankverbindung, Ansprechpartner — Footer + /kontakt.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("contact-info")] },
  fields: [
    {
      name: "addresses",
      type: "array",
      label: "Adressen",
      admin: { description: "Mehrere möglich (Postanschrift, Vereinsheim …)." },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          label: "Bezeichnung",
          admin: {
            description: "z.B. 'Postanschrift', 'Vereinsheim Eschengarten'.",
          },
        },
        {
          name: "street",
          type: "text",
          required: true,
          label: "Straße & Hausnummer",
        },
        { name: "postalCode", type: "text", required: true, label: "PLZ" },
        {
          name: "city",
          type: "text",
          required: true,
          defaultValue: "München",
          label: "Stadt",
        },
      ],
    },
    {
      name: "phone",
      type: "text",
      defaultValue: "0172 2392919",
      label: "Haupt-Telefonnummer",
    },
    {
      name: "email",
      type: "email",
      required: true,
      defaultValue: "info@svnord.de",
      label: "Haupt-E-Mail",
    },
    {
      name: "iban",
      type: "text",
      label: "IBAN",
      admin: { description: "Für Mitgliedsbeiträge und Spenden." },
    },
    {
      name: "openingHours",
      type: "array",
      label: "Öffnungszeiten Vereinsheim",
      fields: [
        {
          name: "day",
          type: "text",
          required: true,
          label: "Tag(e)",
          admin: { description: "z.B. 'Mo–Fr', 'Sa', 'So'." },
        },
        {
          name: "hours",
          type: "text",
          required: true,
          label: "Uhrzeit",
          admin: { description: "z.B. '17:00–22:00' oder 'geschlossen'." },
        },
      ],
    },
    {
      name: "mapEmbedSrc",
      type: "text",
      label: "Google-Maps Einbettungs-Link",
      admin: {
        description:
          "Optional. Die 'src'-URL aus dem Google-Maps iframe-Embed-Code einfügen.",
      },
    },
  ],
};
