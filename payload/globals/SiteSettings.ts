import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("site-settings")] },
  fields: [
    { name: "name", type: "text", required: true, defaultValue: "SV Nord München-Lerchenau e.V." },
    { name: "tagline", type: "text", defaultValue: "Einmal Nordler, immer Nordler." },
    { name: "description", type: "textarea" },
    { name: "ogImage", type: "upload", relationTo: "media" },
    {
      name: "social",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          options: [
            { label: "Instagram", value: "instagram" },
            { label: "Facebook", value: "facebook" },
            { label: "YouTube", value: "youtube" },
            { label: "X / Twitter", value: "x" },
            { label: "TikTok", value: "tiktok" },
          ],
          required: true,
        },
        { name: "url", type: "text", required: true },
      ],
    },
  ],
};
