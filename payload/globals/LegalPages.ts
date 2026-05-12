import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const LegalPages: GlobalConfig = {
  slug: "legal-pages",
  label: "Impressum & Datenschutz",
  admin: {
    group: "4. Seiten",
    description: "Pflichttexte für /impressum und /datenschutz.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("legal-pages")] },
  fields: [
    {
      name: "impressumBody",
      type: "richText",
      required: true,
      label: "Impressum-Text",
      admin: {
        description:
          "Pflichtangaben gemäß § 5 TMG. Erscheint unter /impressum.",
      },
    },
    {
      name: "datenschutzBody",
      type: "richText",
      required: true,
      label: "Datenschutz-Text",
      admin: {
        description:
          "DSGVO-Erklärung. Vor Änderungen am besten Rechtsbeistand fragen. Erscheint unter /datenschutz.",
      },
    },
  ],
};
