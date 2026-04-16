import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const VereinsheimPage: GlobalConfig = {
  slug: "vereinsheim-page",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("vereinsheim-page")] },
  fields: [
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "intro", type: "textarea" },
    { name: "body", type: "richText", required: true },
    {
      name: "gallery",
      type: "array",
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" },
      ],
    },
  ],
};
