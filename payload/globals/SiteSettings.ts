import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Allgemeine Einstellungen",
  admin: {
    group: "5. Einstellungen",
    description: "Vereinsname, Tagline, Social-Links — global verwendet.",
  },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("site-settings")] },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Vereinsname",
      defaultValue: "SV Nord München-Lerchenau e.V.",
    },
    {
      name: "tagline",
      type: "text",
      label: "Vereins-Motto",
      defaultValue: "Einmal Nordler, immer Nordler.",
    },
    {
      name: "description",
      type: "textarea",
      label: "Kurzbeschreibung (SEO)",
      admin: {
        description:
          "1–2 Sätze. Wird in Google-Suchergebnissen und beim Teilen angezeigt.",
      },
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      label: "Teilen-Bild (Social Media)",
      admin: {
        description:
          "Bild beim Teilen in WhatsApp/Facebook etc. Empfohlen: 1200×630 px.",
      },
    },
    {
      name: "social",
      type: "array",
      label: "Social-Media-Profile",
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
