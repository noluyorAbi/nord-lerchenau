import { getPayload } from "payload";
import { cache } from "react";

import config from "@/payload.config";

export const getPayloadClient = cache(async () => {
  return await getPayload({ config });
});
