import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const FaqPage: GlobalConfig = {
  slug: "faq-page",
  label: "FAQ (Häufige Fragen)",
  admin: {
    group: "4. Seiten",
    description: "Inhalte der Seite /faq.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("faq-page")] },
  fields: [
    {
      name: "intro",
      type: "textarea",
      label: "Einleitung",
      admin: { description: "Kurze Einleitung über dem Fragen-Akkordeon." },
    },
    {
      name: "items",
      type: "array",
      minRows: 0,
      label: "Fragen & Antworten",
      labels: { singular: "Frage", plural: "Fragen" },
      fields: [
        {
          name: "question",
          type: "text",
          required: true,
          label: "Frage",
        },
        {
          name: "answer",
          type: "textarea",
          required: true,
          label: "Antwort",
        },
        {
          name: "group",
          type: "select",
          defaultValue: "allgemein",
          label: "Kategorie",
          admin: {
            description:
              "Fragen werden auf der Seite nach Kategorie gruppiert.",
          },
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
