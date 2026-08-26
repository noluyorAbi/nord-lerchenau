import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const LegalPages: GlobalConfig = {
  slug: "legal-pages",
  label: "Impressum & Datenschutz",
  admin: {
    group: "4. Seiten",
    description:
      "Die Texte auf /impressum und /datenschutz. Leer lassen heißt: die mitgelieferte Fassung bleibt stehen.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("legal-pages")] },
  fields: [
    {
      name: "impressumBody",
      type: "richText",
      label: "Impressum-Text",
      admin: {
        description:
          "Pflichtangaben zum Anbieter. Erscheint unter /impressum. Die Anschrift oben auf der Seite kommt aus den Kontaktdaten, nicht von hier.",
      },
    },
    {
      name: "datenschutzBody",
      type: "richText",
      label: "Datenschutz-Text",
      admin: {
        description:
          "DSGVO-Erklärung. Vor Änderungen bitte Rechtsbeistand fragen: hier steht, welche Daten der Verein verarbeitet. Erscheint unter /datenschutz.",
      },
    },
  ],
};
