import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const ContactInfo: GlobalConfig = {
  slug: "contact-info",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("contact-info")] },
  fields: [
    {
      name: "addresses",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true, admin: { description: "z.B. 'Postanschrift', 'Vereinsheim Eschengarten'" } },
        { name: "street", type: "text", required: true },
        { name: "postalCode", type: "text", required: true },
        { name: "city", type: "text", required: true, defaultValue: "München" },
      ],
    },
    { name: "phone", type: "text", defaultValue: "0172 2392919" },
    { name: "email", type: "email", required: true, defaultValue: "info@svnord.de" },
    { name: "iban", type: "text", admin: { description: "Für Mitgliedsbeiträge / Spenden." } },
    {
      name: "openingHours",
      type: "array",
      fields: [
        { name: "day", type: "text", required: true, admin: { description: "z.B. Mo–Fr, Sa, So" } },
        { name: "hours", type: "text", required: true, admin: { description: "z.B. 17:00–22:00 oder geschlossen" } },
      ],
    },
    { name: "mapEmbedSrc", type: "text", admin: { description: "Optional iframe src für Google Maps embed." } },
  ],
};
