import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Allgemeine Einstellungen",
  admin: {
    group: "5. Einstellungen",
    description:
      "Vereinsname und SEO-Angaben (Beschreibung, Teilen-Bild), global verwendet.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("site-settings")] },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Vereinsname",
      admin: {
        description: "Wird global verwendet (z.B. im Footer).",
      },
      defaultValue: "SV Nord München-Lerchenau e.V.",
    },
    {
      name: "tagline",
      type: "text",
      label: "Vereins-Motto",
      admin: { hidden: true },
      defaultValue: "Einmal Nordler, immer Nordler.",
    },
    {
      name: "description",
      type: "textarea",
      label: "Kurzbeschreibung (SEO)",
      admin: { hidden: true },
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      label: "Teilen-Bild (Social Media)",
      admin: { hidden: true },
    },
    {
      name: "social",
      type: "array",
      label: "Social-Media-Profile",
      admin: { hidden: true },
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          label: "Plattform",
          options: [
            { label: "Instagram", value: "instagram" },
            { label: "Facebook", value: "facebook" },
            { label: "YouTube", value: "youtube" },
            { label: "X / Twitter", value: "x" },
            { label: "TikTok", value: "tiktok" },
          ],
        },
        {
          name: "url",
          type: "text",
          required: true,
          label: "Profil-Link",
          admin: { description: "Vollständige URL inkl. https://." },
        },
      ],
    },
  ],
};
