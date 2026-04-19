import type {
  CollectionAfterChangeHook,
  GlobalAfterChangeHook,
} from "payload";

function fireRevalidate(payload: {
  type: "collection" | "global";
  resource: string;
  slug?: string | null;
  sport?: string | null;
}) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return;

  const base =
    process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

  // Fire-and-forget. We don't block the save on the revalidation call.
  void fetch(`${base}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, secret }),
  }).catch((err) => {
    console.warn("[revalidate hook] failed to POST:", err);
  });
}

export const revalidateOnChange =
  (resource: string): CollectionAfterChangeHook =>
  ({ doc }) => {
    const d = doc as { slug?: unknown; sport?: unknown };
    fireRevalidate({
      type: "collection",
      resource,
      slug: typeof d.slug === "string" ? d.slug : null,
      sport: typeof d.sport === "string" ? d.sport : null,
    });
    return doc;
  };

export const revalidateGlobalOnChange =
  (resource: string): GlobalAfterChangeHook =>
  ({ doc }) => {
    fireRevalidate({ type: "global", resource });
    return doc;
  };
