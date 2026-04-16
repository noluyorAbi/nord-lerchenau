import type { GlobalConfig } from "payload";

import { anyone } from "../access/anyone";
import { authenticated } from "../access/authenticated";
import { revalidateGlobalOnChange } from "../hooks/revalidate";

export const LegalPages: GlobalConfig = {
  slug: "legal-pages",
  admin: { group: "Settings" },
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalOnChange("legal-pages")] },
  fields: [
    { name: "impressumBody", type: "richText", required: true },
    { name: "datenschutzBody", type: "richText", required: true },
  ],
};
