import type { CollectionBeforeChangeHook } from "payload";

import { slug as toSlug } from "@/lib/slug";

/**
 * Derives `slug` from another text field when the editor left it empty.
 * Never regenerates an existing slug: a partial update that sends only the
 * title must not move a live URL.
 */
export const fillSlugFrom =
  (field: string): CollectionBeforeChangeHook =>
  ({ data, originalDoc }) => {
    if (!data.slug && !originalDoc?.slug && data[field]) {
      data.slug = toSlug(String(data[field]));
    }
    return data;
  };
