import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const ChronikPage: GlobalConfig = {
  slug: "chronik-page",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("chronik-page")] },
  fields: [
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "intro", type: "textarea" },
    { name: "body", type: "richText", required: true },
  ],
};
