import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const FaqPage: GlobalConfig = {
  slug: "faq-page",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("faq-page")] },
  fields: [
    {
      name: "intro",
      type: "textarea",
      admin: { description: "Kurze Einleitung über dem FAQ-Akkordeon." },
    },
    {
      name: "items",
      type: "array",
      minRows: 0,
      labels: { singular: "Frage", plural: "Fragen" },
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
        {
          name: "group",
          type: "select",
          defaultValue: "allgemein",
          options: [
            { label: "Allgemein", value: "allgemein" },
            { label: "Mitgliedschaft", value: "mitgliedschaft" },
            { label: "Training & Spielbetrieb", value: "training" },
            { label: "Vereinsheim", value: "vereinsheim" },
          ],
        },
      ],
    },
  ],
};
