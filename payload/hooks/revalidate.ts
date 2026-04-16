import type {
  CollectionAfterChangeHook,
  GlobalAfterChangeHook,
} from "payload";

/**
 * P1 stub. P4 wires this to POST /api/revalidate with the right tags.
 * For now, it just logs — schema work in P1 doesn't yet require revalidation.
 */
export const revalidateOnChange =
  (resource: string): CollectionAfterChangeHook =>
  ({ doc }) => {
    if (process.env.NODE_ENV === "development") {
      const id = (doc as { id?: unknown }).id;
      console.info(`[revalidate stub] ${resource} #${String(id)} changed`);
    }
    return doc;
  };

export const revalidateGlobalOnChange =
  (resource: string): GlobalAfterChangeHook =>
  ({ doc }) => {
    if (process.env.NODE_ENV === "development") {
      console.info(`[revalidate stub] global '${resource}' changed`);
    }
    return doc;
  };
