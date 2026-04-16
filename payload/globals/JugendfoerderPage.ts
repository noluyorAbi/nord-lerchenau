import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const JugendfoerderPage: GlobalConfig = {
  slug: "jugendfoerder-page",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("jugendfoerder-page")] },
  fields: [
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "body", type: "richText", required: true },
    { name: "iban", type: "text", admin: { description: "Spenden-IBAN für den Jugendförderverein." } },
    { name: "contactEmail", type: "email" },
  ],
};
